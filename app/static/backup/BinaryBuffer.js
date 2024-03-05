class MessageType {
    PING = 0;
    PONG = 1;
    GAME_POSITION = 2;
}
class FieldMetaData {
    constructor(getter, setter, bufferGetterFunc, bufferSetterFunc) {
        this.fieldGetter = getter;
        this.fieldSetter = setter;
        this.bufferGetterFunc = bufferGetterFunc;
        this.bufferSetterFunc = bufferSetterFunc;
    }
    fieldGetter = function (instance) { };
    fieldSetter = function (instance, value) { };
    bufferGetterFunc = function (packer) { };
    bufferSetterFunc = function (packer, value) { };
}

export class BinaryBuffer {
    _dataBuffer;
    _byteOffset = 0;
    _view;
    _floatGetter;
    _floatSetter;

    serializeObjToBuffer(obj) {
        this._packFieldsData(obj);
        const arr = this._dataBuffer.slice(0, this._byteOffset);
        this._byteOffset = 0;
        return arr;
    }

    deserializeBufferToObj(obj) {
        this._unPackFieldsData(obj);
        this._byteOffset = 0;
        return obj;
    }

    constructor(dataBuffer, convertToFloat32) {
        this._dataBuffer = dataBuffer.buffer;
        this._view = new DataView(dataBuffer.buffer);
        this._byteOffset = 0;
        if (convertToFloat32) {
            this._floatGetter = this.getFloat32;
            this._floatSetter = this.setFloat32;
        }
        else {
            this._floatGetter = this.getFloat64;
            this._floatSetter = this.setFloat64;
        }
        // this.initializeObjectMetadata(obj);
    }

    calculateBufferSize(obj) {

    }

    getBufferSetterFunc(value) {
        const type = typeof value;
        if (type === 'number') {
            if (Number.isInteger(value)) {
                // JavaScript doesn't distinguish between int sizes or signed/unsigned
                if (value < 0) {
                    // if (value <= 255) return this.setUInt8;
                    // if (value <= 65535) return this.setUInt16;
                    if (value <= 4294967295) return this.setUInt32;
                    return this.setUInt64;
                } else {
                    // if (value >= -128 && value <= 127) return this.setInt8;
                    // if (value >= -32768 && value <= 32767) return this.setInt16;
                    if (value >= -2147483648 && value <= 2147483647) return this.setInt32;
                    return this.setInt64;
                }
            } else {
                return this._floatGetter;
            }
        } else if (type === 'string') {

            return this.setString;
        } else if (value instanceof Float32Array)
            return this.setFloat32Array;
        else if (value instanceof Float64Array) {
            return this.setFloat64Array;
        }
        else if (value instanceof Int8Array) {
            return this.setInt8Array;
        }
        else if (value instanceof Int16Array) {
            return this.setInt16Array;
        }
        else if (value instanceof Int32Array) {
            return this.setInt32Array;
        }
        else if (value instanceof BigInt64Array) {
            return this.setInt64Array;
        }
        else if (value instanceof Uint8Array) {
            return this.setUInt8Array;
        }
        else if (value instanceof Uint16Array) {
            return this.setUInt16Array;
        }
        else if (value instanceof Uint32Array) {
            return this.setUInt32Array;
        }
        else if (value instanceof BigUint64Array) {
            return this.setUInt64Array;
        }
        throw new TypeError('Invalid Type cannot be converted to binary data.')
    }

    getBufferGetterFunc(value) {
        const type = typeof value;
        if (type === 'number') {
            if (Number.isInteger(value)) {
                // JavaScript doesn't distinguish between int sizes or signed/unsigned
                if (value < 0) {
                    // if (value <= 255) return this.getUInt8;
                    // if (value <= 65535) return this.getUInt16;
                    if (value <= 4294967295) return this.getUInt32;
                    return this.getUInt64;
                } else {
                    // if (value >= -128 && value <= 127) return this.getInt8;
                    // if (value >= -32768 && value <= 32767) return this.getInt16;
                    if (value >= -2147483648 && value <= 2147483647) return this.getInt32;
                    return this.getInt64;
                }
            } else {
                return this._floatGetter;
            }
        } else if (type === 'string') {
            return this.getString;
        } else if (value instanceof Float32Array)
            return this.getFloat32Array;
        else if (value instanceof Float64Array) {
            return this.getFloat64Array;
        }
        else if (value instanceof Int8Array) {
            return this.getInt8Array;
        }
        else if (value instanceof Int16Array) {
            return this.getInt16Array;
        }
        else if (value instanceof Int32Array) {
            return this.getInt32Array;
        }
        else if (value instanceof BigInt64Array) {
            return this.getInt64Array;
        }
        else if (value instanceof Uint8Array) {
            return this.getUInt8Array;
        }
        else if (value instanceof Uint16Array) {
            return this.getUInt16Array;
        }
        else if (value instanceof Uint32Array) {
            return this.getUInt32Array;
        }
        else if (value instanceof BigUint64Array) {
            return this.getUInt64Array;
        }
        throw new TypeError('Invalid Type cannot be converted to binary data.')
    }

    initializeObjectMetadata(proto, obj) {

        if (!proto._fieldsMetaData) {
            proto._fieldsMetaData = [];
            for (const key of Object.keys(obj)) {
                if (key === "_fieldsMetaData")
                    continue;
                if (key === "type") {
                    proto._fieldsMetaData.unshift(
                        new FieldMetaData(
                            (instance) => instance[key],
                            (instance, fieldValue) => instance[key] = fieldValue,
                            this.getBufferGetterFunc(obj[key]),
                            this.getBufferSetterFunc(obj[key])
                        )
                    );
                }
                else {
                    proto._fieldsMetaData.push(
                        new FieldMetaData(
                            (instance) => instance[key],
                            (instance, fieldValue) => instance[key] = fieldValue,
                            this.getBufferGetterFunc(obj[key]),
                            this.getBufferSetterFunc(obj[key])
                        )
                    );
                }
            }
        }
    }

    _unPackFieldsData(obj) {
        var proto = Object.getPrototypeOf(obj);
        this.initializeObjectMetadata(proto, obj);
        for (const metaData of proto._fieldsMetaData) {
            const fieldValue = metaData.bufferGetterFunc(this);
            metaData.fieldSetter(obj, fieldValue);
        }
    }

    _packFieldsData(obj) {
        var proto = Object.getPrototypeOf(obj);
        this.initializeObjectMetadata(proto, obj);
        for (const metaData of proto._fieldsMetaData) {
            const fieldValue = metaData.fieldGetter(obj);
            metaData.bufferSetterFunc(this, fieldValue);
        }
    }

    getString(packer) {
        const stringLength = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        const uint8View = new Uint8Array(packer._dataBuffer, packer._byteOffset, stringLength);
        const decoder = new TextDecoder('utf-8');
        const decodedString = decoder.decode(uint8View);
        packer._byteOffset += stringLength;
        return decodedString;
    }

    increment4() {
        var left = this._byteOffset % 4;
        if (left)
            this._byteOffset += left;
    }

    increment8() {
        var left = this._byteOffset % 8;
        if (left)
            this._byteOffset += left;
        else
            this._byteOffset += 4;
    }

    getUInt8(packer) {
        const val = packer._view.getUint8(packer._byteOffset);
        packer._byteOffset++;
        return val;
    }

    getInt8(packer) {
        const val = packer._view.getInt8(packer._byteOffset);
        packer._byteOffset++;
        return val;
    }

    getUInt16(packer) {
        const val = packer._view.getUint16(packer._byteOffset);
        packer._byteOffset += 2;
        return val;
    }

    getInt16(packer) {
        const val = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        return val;
    }

    getUInt32(packer) {
        const val = packer._view.getUint32(packer._byteOffset);
        packer._byteOffset += 4;
        return val;
    }

    getInt32(packer) {
        const val = packer._view.getInt32(packer._byteOffset);
        packer._byteOffset += 4;
        return val;
    }

    getUInt64(packer) {
        const val = packer._view.getBigUint64(packer._byteOffset);
        packer._byteOffset += 8;
        return val;
    }

    getInt64(packer) {
        const val = packer._view.getBigInt64(packer._byteOffset);
        packer._byteOffset += 8;
        return val;
    }

    getFloat32(packer) {
        const val = packer._view.getFloat32(packer._byteOffset);
        packer._byteOffset += 4;
        return val;
    }

    getFloat64(packer) {
        const val = packer._view.getFloat64(packer._byteOffset);
        packer._byteOffset += 8;
        return val;
    }

    getUInt8Array(packer) {
        const arrayLength = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new Uint8Array(packer._byteOffset, packer._dataBuffer, arrayLength);
        packer._byteOffset += arrayLength;
        return array;
    }

    getInt8Array(packer) {
        const arrayLength = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new Int8Array(packer._byteOffset, packer._dataBuffer, arrayLength);
        packer._byteOffset += arrayLength;
        return array;
    }

    getUInt16Array(packer) {
        const arrayLength = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new Uint16Array(packer._byteOffset, packer._dataBuffer, arrayLength);
        packer._byteOffset += arrayLength * 2;
        return array;
    }

    getInt16Array(packer) {
        const arrayLength = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new Int16Array(packer._byteOffset, packer._dataBuffer, arrayLength);
        packer._byteOffset += arrayLength * 2;
        return array;
    }

    getUInt32Array(packer) {
        const arrayLength = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new Uint32Array(packer._byteOffset, packer._dataBuffer, arrayLength);
        packer._byteOffset += arrayLength * 4;
        return array;
    }

    getInt32Array(packer) {
        const arrayLength = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new Int32Array(packer._byteOffset, packer._dataBuffer, arrayLength);
        packer._byteOffset += arrayLength * 4;
        return array;
    }

    getUInt64Array(packer) {
        const arrayLength = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new BigUint64Array(packer._byteOffset, packer._dataBuffer, arrayLength);
        packer._byteOffset += arrayLength * 8;
        return array;
    }

    getInt64Array(packer) {
        const arrayLength = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new BigInt64Array(packer._byteOffset, packer._dataBuffer, arrayLength);
        packer._byteOffset += arrayLength * 8;
        return array;
    }

    getFloat32Array(packer) {
        const arrayLenght = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new Float32Array(packer._byteOffset, packer._dataBuffer, arrayLenght);
        packer._byteOffset += arrayLenght * 4;
        return array;
    }

    getFloat64Array(packer) {
        const arrayLenght = packer._view.getInt16(packer._byteOffset);
        packer._byteOffset += 2;
        let array = new Float64Array(packer._byteOffset, packer._dataBuffer, arrayLenght);
        packer._byteOffset += arrayLenght * 8;
        return array;
    }

    setString(packer, strValue) {
        if (!strValue) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const stringLength = strValue.length;
        packer._view.setInt16(packer._byteOffset,);
        packer._byteOffset += 2;
        const view = new Uint8Array(packer._dataBuffer, packer._byteOffset, stringLength);
        const encoder = new TextEncoder('utf-8');
        const decodedString = encoder.encode(strValue);
        view.set(decodedString);
        packer._byteOffset += stringLength;
    }

    setUInt8(packer, value) {

        packer._view.setUint8(packer._byteOffset, value);
        packer._byteOffset++;
    }

    setInt8(packer, value) {
        packer._view.setInt8(packer._byteOffset, value);
        packer._byteOffset++;
    }

    setUInt16(packer, value) {
        packer._view.setUint16(packer._byteOffset, value);
        packer._byteOffset += 2;
    }

    setInt16(packer, value) {
        packer._view.setFloat64(packer._byteOffset, value);
        packer._byteOffset += 2;
    }

    setUInt32(packer, value) {
        packer._view.setUInt32(packer._byteOffset, value);
        packer._byteOffset += 4;
    }

    setInt32(packer, value) {
        packer._view.setInt32(packer._byteOffset, value);
        packer._byteOffset += 4;
    }

    setInt64(packer, value) {
        packer._view.setBigInt64(packer._byteOffset, BigInt(value));
        packer._byteOffset += 8;
    }

    setUInt64(packer, value) {
        packer._view.setBigUint64(packer._byteOffset, BigInt(value));
        packer._byteOffset += 8;
    }

    setFloat32(packer, value) {
        packer._view.setFloat32(packer._byteOffset, value);
        packer._byteOffset += 4;
    }

    setFloat64(packer, value) {
        packer._view.setFloat64(packer._byteOffset, value);
        packer._byteOffset += 8;
    }

    setUInt8Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, bufferArray.length);
        packer._byteOffset += 2;
        let view = new Uint8Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        packer._byteOffset += arrayLenght;
        view.set(bufferArray);
    }

    setInt8Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, bufferArray.length);
        packer._byteOffset += 2;
        let view = new Int8Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        packer._byteOffset += arrayLenght;
        view.set(bufferArray);
    }

    setUInt16Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, bufferArray.length);
        packer._byteOffset += 2;
        let view = new Uint16Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        packer._byteOffset += arrayLenght * 2;
        view.set(bufferArray);

    }

    setInt16Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, bufferArray.length);
        packer._byteOffset += 2;
        let view = new Int16Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        packer._byteOffset += arrayLenght * 2;
        view.set(bufferArray);

    }

    setUInt32Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, bufferArray.length);
        packer._byteOffset += 2;
        packer.increment4();
        let view = new Uint32Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        packer._byteOffset += arrayLenght * 4;
        view.set(bufferArray);

    }

    setInt32Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, bufferArray.length);
        packer._byteOffset += 2;
        packer.increment4();
        let view = new Int32Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        packer._byteOffset += arrayLenght * 4;
        view.set(bufferArray);

    }

    setUInt64Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, bufferArray.length);
        packer._byteOffset += 2;
        packer.increment8();
        let view = new BigUint64Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        packer._byteOffset += arrayLenght * 8;
        view.set(bufferArray);

    }

    setInt64Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, bufferArray.length);
        packer._byteOffset += 2;
        packer.increment8();
        let view = new BigInt64Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        packer._byteOffset += arrayLenght * 8;
        view.set(bufferArray);
    }

    setFloat32Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, arrayLenght);
        packer._byteOffset += 2;
        packer.increment4();
        let view = new Float32Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        view.set(bufferArray);
        packer._byteOffset += arrayLenght * 4;
    }

    setFloat64Array(packer, bufferArray) {
        if (!bufferArray) {
            packer._view.setInt16(packer._byteOffset, 0);
            packer._byteOffset += 2;
            return;
        }
        const arrayLenght = bufferArray.length;
        packer._view.setInt16(packer._byteOffset, bufferArray.length);
        packer._byteOffset += 2;
        packer.increment8();
        let view = new Float64Array(packer._dataBuffer, packer._byteOffset, arrayLenght);
        view.set(bufferArray);
        packer._byteOffset += arrayLenght * 8;
    }
}
