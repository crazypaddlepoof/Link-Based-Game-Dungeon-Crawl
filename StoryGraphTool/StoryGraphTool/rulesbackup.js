class Start extends Scene {
    create() {
        // Set the title from the story data
        this.engine.setTitle(this.engine.storyData.Title);
        // Add a button to begin the story
        this.engine.addChoice("Begin the story", () => {
            this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
        });
    }
}

class Location extends Scene {
    create(key) {
        // Retrieve the location data from the story JSON
        let locationData = this.engine.storyData.Locations[key];
        // Display the body text of the location
        this.engine.show(locationData.Body);


        

        if (key === "Torch Room Final" && this.engine.globalState.chestAppears) {
            this.engine.addChoice("Open the Chest", () => {
                this.engine.show("You found a key inside the chest!");
                
                
                this.engine.addChoice("Retreat", () => this.engine.gotoScene(Location, "Throne Room"));

                if (locationData.items) {
                    locationData.items.forEach(item => {
                        this.engine.addChoice(` ${item.description}`, () => this.handleItemPickup(item, key));
                    });
                }
                
            });
        }





        // Handle interactions if present
        if (locationData.interactions) {
            locationData.interactions.forEach(interaction => {
                // Add interaction choices based on the state
                if (interaction.type === "Torch L") {
                    if (interaction.initialState === "unlitL") {
                        this.engine.addChoice("Light the Torch?", () => this.handleTorchRoomLInteraction(interaction));
                    } else {
                        this.engine.addChoice("Light the Torch Again?", () => this.repeatTorchLMessage(interaction));
                    }
                } else if(interaction.type === "Torch R"){
                    if (interaction.initialState === "unlitR") {
                        this.engine.addChoice("Light the Torch?", () => this.handleTorchRoomRInteraction(interaction));
                    } else {
                        this.engine.addChoice("Light the Torch Again?", () => this.repeatTorchRMessage(interaction));
                    }
                }
                else {
                    this.engine.addChoice(interaction.description, () => this.handle(interaction));
                }
            });
        }

        // Add choices for moving or other actions
        this.addChoices(locationData);
    }

    handleItemPickup(item, locationKey) {
        if (!this.engine.inventory.hasItem(item.id)) {
            this.engine.inventory.addItem(item.id);
            this.engine.show('You picked up ${item.description}.');
            // Optionally remove the pickup option or disable it
            // Optionally provide a choice to go back after picking up the item
            this.engine.addChoice("Continue to guard room", () => this.engine.gotoScene(Location, locationKey));
        } else {
            this.engine.show('You already have the ${item.description}.');
            // Provide an option to continue exploring even if the item is already picked
            this.engine.addChoice("Continue to guard room", () => this.engine.gotoScene(Location, locationKey));
        }
    }


    handleTorchRoomLInteraction(interaction) {
        if (interaction.initialState === "unlitL") {
            interaction.initialState = "litL";  // Change the state to lit
            this.engine.show(`You lit the Torch!`);
            this.engine.addChoice("Retreat", () => this.engine.gotoScene(Location, "Hallway L"));
            this.engine.globalState.litTorchL = true;
            this.checkTorchConditions();
        }
    }

    handleTorchRoomRInteraction(interaction) {
        if (interaction.initialState === "unlitR") {
            interaction.initialState = "litR";  // Change the state to lit
            this.engine.show(`You lit the Torch!`);
            this.engine.addChoice("Retreat", () => this.engine.gotoScene(Location, "Hallway R"));
            this.engine.globalState.litTorchR = true;
            this.checkTorchConditions();
        }
    }

    repeatTorchLMessage(interaction) {
        this.engine.show(`The Torch is already lit`);
        this.engine.addChoice("Retreat", () => this.engine.gotoScene(Location, "Hallway L"));
    }

    repeatTorchRMessage(interaction) {
        this.engine.show(`The Torch is already lit`);
        this.engine.addChoice("Retreat", () => this.engine.gotoScene(Location, "Hallway R"));
    } 

    checkTorchConditions(){
        console.log ("check");
        if (this.engine.globalState.litTorchL && this.engine.globalState.litTorchR) {
            this.engine.globalState.chestAppears = true; 
            
        }
        console.log (this.engine.globalState.chestAppears);
            console.log (this.engine.globalState.litTorchL);
            console.log (this.engine.globalState.litTorchR);
    }

    addChoices(locationData) {
        locationData.Choices.forEach(choice => {
            if (choice.requiredItem) {
                this.engine.addChoice(choice.Text, () => this.handleConditionalChoice(choice));
            } else {
                this.engine.addChoice(choice.Text, () => this.engine.gotoScene(Location, choice.Target));
            }
        });
    } 


    handleConditionalChoice(choice) {
        if (this.engine.inventory.hasItem(choice.requiredItem)) {
            this.engine.show(choice.successText);
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.show(choice.failText);
            this.engine.addChoice("Back away", () => this.engine.gotoScene(Location, "Throne Room"));
        }
    }
}
class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}
Engine.load(Start, 'myStory.json');