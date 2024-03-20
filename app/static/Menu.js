export class Menu {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.initializeMainMenu();
        this.mode = null;
    }

    initializeMainMenu() {
        document.addEventListener('DOMContentLoaded', () => {
            const mainMenu = document.getElementById('mainMenu');
            mainMenu.style.display = 'block';

            document.getElementById('localOption').addEventListener('click', () => this.handleOptionSelection('local'));
            document.getElementById('onlineOption').addEventListener('click', () => this.handleOptionSelection('online'));

            // Event listeners for local submenu buttons
            document.getElementById('localNormal').addEventListener('click', () => this.handleLocalModeSelection('localNormal'));
            document.getElementById('localDupliPong').addEventListener('click', () => this.handleLocalModeSelection('localDupliPong'));
            document.getElementById('localCustom').addEventListener('click', () => this.handleLocalModeSelection('localCustom'));

            //Event listeners for VsAi submenu buttons
            document.getElementById('vsPlayer').addEventListener('click', () => this.handleVsAiSelection(false));
            document.getElementById('vsAi').addEventListener('click', () => this.handleVsAiSelection(true));

            // Event listeners for online submenu buttons
            document.getElementById('onlineNormal').addEventListener('click', () => this.handleOnlineModeSelection(1));
            document.getElementById('onlineDupliPong').addEventListener('click', () => this.handleOnlineModeSelection(2));
            document.getElementById('onlineCustom').addEventListener('click', () => this.handleOnlineModeSelection(3));

            // Add event listeners for custom submenu inputs
            document.getElementById('leftPlayerName').addEventListener('input', () => this.handleLeftPlayerNameChange());
            document.getElementById('numberOfBalls').addEventListener('input', () => this.handleNumberOfBallsChange());
            document.getElementById('DuplicateMode').addEventListener('change', () => this.handleDuplicateModeChange());
        
        });
    }
    async handleCustomModeSelection(){
        document.getElementById('vsAIMenu').style.display = 'none';
        document.getElementById('localCustomMenu').style.display = 'block';
    }

    async handleOptionSelection(option) {
        if (option === 'local') {
            // Show the local submenu
            document.getElementById('localMenu').style.display = 'block';
            document.getElementById('onlineMenu').style.display = 'none'; // Hide online submenu   
        } else if (option === 'online') {
            // Show the online submenu
            document.getElementById('localMenu').style.display = 'none'; // Hide local submenu
            document.getElementById('onlineMenu').style.display = 'block';
        }
    }

    async handleVsAiSelection(isVsAi){
        document.getElementById('vsAIMenu').style.display = 'none';
        if (this.mode === 'localCustom')
            document.getElementById('localCustomMenu').style.display = 'block';
        else
            await this.gameManager.handleLocalModeSelection(this.mode, isVsAi);
    }

    async handleLocalModeSelection(mode) {
        this.mode = mode;
        document.getElementById('localMenu').style.display = 'none';
        document.getElementById('vsAIMenu').style.display = 'block';

        // await this.gameManager.handleLocalModeSelection(mode);
    }

    async handleOnlineModeSelection(mode) {
        this.gameManager.isRemote = 1;
        await this.gameManager.handleModeSelection(mode);
    }

    handleLeftPlayerNameChange(){

    }
    
}

