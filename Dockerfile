FROM python:3.10.6

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --upgrade pip
COPY requirements.txt /app/
COPY /app/build.sh /app/
COPY /app/run.sh /app/
RUN bash build.sh
RUN chmod +x /app/run.sh

COPY . /app/
