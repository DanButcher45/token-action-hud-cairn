// System Module Imports
import {Utils} from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
     */
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
        /**
         * Build system actions
         * Called by Token Action HUD Core
         * @override
         * @param {array} groupIds
         */
        async buildSystemActions(groupIds) {
            if (this.actor) {
                this.buildCharacterActions();
            } else if (!this.actor) {
                this.buildMultipleTokenActions();
            }
            this.buildUtilityActions();
        }

        buildMultipleTokenActions() {
        }

        /**
         * Build character actions
         * @private
         */
        buildCharacterActions() {

            const weaponActions = [];
            const weapons = this.actor.items.filter(w => w.type === 'weapon' && w.system.equipped === true);

            const spellActions = [];
            const spells = this.actor.items.filter(w => w.type === 'spellbook' && w.system.equipped === true);

            if (this.actor.type == "character" || this.actor.type == "npc") {

                // ### Actions ###
                
                // Weapons
                for (let a in weapons) {
                    const name = game.i18n.localize(weapons[a].name);
                    const weaponEncodedValue = ['action_weapons', weapons[a].id].join('|');
                    weaponActions.push({name: name, img: weapons[a].img, cssClass: "toggle", id: a, encodedValue: weaponEncodedValue});
                }
                this.addActions(weaponActions, {id: 'action_weapons', type: 'system'});

                // Spells
                for (let a in spells) {
                    const name = game.i18n.localize(spells[a].name);
                    const spellEncodedValue = ['action_spells', spells[a].id].join('|');
                    spellActions.push({name: name, img: spells[a].img, cssClass: "toggle", id: a, encodedValue: spellEncodedValue});
                }
                this.addActions(spellActions, {id: 'action_spells', type: 'system'});
            }
            
            const weaponInvActions = [];
            const inv_weapons = this.actor.items.filter(w => w.type === 'weapon');
            for (let a in inv_weapons) {
                const name = (this.actor.type == "character" || this.actor.type == "npc") ? [inv_weapons[a].system.equipped == true ? '+' : '-', game.i18n.localize(inv_weapons[a].name)].join('') : game.i18n.localize(inv_weapons[a].name);
                const weaponEncodedValue = ['inventory_weapons', inv_weapons[a].id].join('|');
                weaponInvActions.push({name: name, img: inv_weapons[a].img, cssClass: "toggle", selected: inv_weapons[a].system.equipped == true ? true : false, id: a, encodedValue: weaponEncodedValue});
            }
            this.addActions(weaponInvActions, {id: 'inventory_weapons', type: 'system'});

            const armorInvActions = [];
            const inv_armors = this.actor.items.filter(w => w.type === 'armor');
            for (let a in inv_armors) {
                const name = (this.actor.type == "character" || this.actor.type == "npc") ? [inv_armors[a].system.equipped == true ? '+' : '-', game.i18n.localize(inv_armors[a].name)].join('') : game.i18n.localize(inv_armors[a].name);
                const spellEncodedValue = ['inventory_armors', inv_armors[a].id].join('|');
                armorInvActions.push({name: name, img: inv_armors[a].img, cssClass: "toggle", id: a, encodedValue: spellEncodedValue});
            }
            this.addActions(armorInvActions, {id: 'inventory_armors', type: 'system'});

            const spellInvActions = [];
            const inv_spells = this.actor.items.filter(w => w.type === 'spellbook');
            for (let a in inv_spells) {
                const name = (this.actor.type == "character" || this.actor.type == "npc") ? [inv_spells[a].system.equipped == true ? '+' : '-', game.i18n.localize(inv_spells[a].name)].join('') : game.i18n.localize(inv_spells[a].name);
                const spellEncodedValue = ['inventory_spells', inv_spells[a].id].join('|');
                spellInvActions.push({name: name, img: inv_spells[a].img, cssClass: "toggle", id: a, encodedValue: spellEncodedValue});
            }
            this.addActions(spellInvActions, {id: 'inventory_spells', type: 'system'});

            const itemsActions = [];
            const items = this.actor.items.filter(w => w.type != 'weapon' && w.type != 'armor' && w.type != 'spellbook');
            for (let a in items) {
                const name = items[a].system.uses.max > 0 ? [[items[a].name, items[a].system.uses.max - items[a].system.uses.value].join(': '), items[a].system.uses.max].join(' / ') : items[a].name;
                const itemEncodedValue = ['inventory_items', items[a].id].join('|');
                const cssClassVal = items[a].system.uses.max > 0 ? "toggle" : "";
                itemsActions.push({name: name, img: items[a].img, cssClass: cssClassVal, id: a, encodedValue: itemEncodedValue});
            }
            this.addActions(itemsActions, {id: 'inventory_items', type: 'system'});
            
            if (this.actor.system.gold != null) {
                const goldActions = [];
                const imgGold = 'modules/token-action-hud-cairn/assets/tokens/gold-piece.webp';
                const name = [game.i18n.localize('CAIRN.Gold'), this.actor.system.gold].join(': ');
                goldActions.push({name: name, img: imgGold, id: '0', encodedValue: "inventory_purse|gold"});
                this.addActions(goldActions, {id: 'inventory_purse', type: 'system'});
            }

            if (this.actor.type == "character" || this.actor.type == "npc") {
                // ### Status ###
 
                // Saves
                const savesActions = [];
                // STR
                const STR = [[game.i18n.localize('STR'), this.actor.system.abilities.STR.value].join(': '), this.actor.system.abilities.STR.max].join(' / ');
                savesActions.push({name: STR, cssClass: "toggle", id: '0', encodedValue: "status_saves|STR"});
                // DEX
                const DEX = [[game.i18n.localize('DEX'), this.actor.system.abilities.DEX.value].join(': '), this.actor.system.abilities.DEX.max].join(' / ');
                savesActions.push({name: DEX, cssClass: "toggle", id: '1', encodedValue: "status_saves|DEX"});
                // WIL
                const WIL = [[game.i18n.localize('WIL'), this.actor.system.abilities.WIL.value].join(': '), this.actor.system.abilities.WIL.max].join(' / ');
                savesActions.push({name: WIL, cssClass: "toggle", id: '2', encodedValue: "status_saves|WIL"});
                // Add Actions for DEX, STR and WIL Saves
                this.addActions(savesActions, {id: 'status_saves', type: 'system'});

                const infosActions = [];
                // HP Info
                const infos_hp = [[game.i18n.localize('CAIRN.HitProtection'), this.actor.system.hp.value].join(': '), this.actor.system.hp.max].join(' / ');
                infosActions.push({name: infos_hp, id: '1', encodedValue: "status_infos|infos_hp"});
                // Armor Info
                const infos_armor = [game.i18n.localize('CAIRN.Armor'), this.actor.system.armor].join(': ');
                infosActions.push({name: infos_armor, id: '0', encodedValue: "status_infos|infos_armor"});
                // Deprived
                let deprived = false;
                if (this.actor.system.deprived != null) {
                    if (this.actor.system.deprived == true) {
                        deprived = true;
                    }
                    const name = [game.i18n.localize('CAIRN.Deprived'), deprived == true ? game.i18n.localize('tokenActionHud.dialog.button.yes') : game.i18n.localize('tokenActionHud.dialog.button.no')].join(': ');
                    infosActions.push({name: name, cssClass: "toggle", id: '2', encodedValue: "status_infos|deprived"});
                }
                // Add infos for Armor, HP and Deprived
                this.addActions(infosActions, {id: 'status_infos', type: 'system'});
                
                // Healing Buttons
                if (deprived == false) {
                    const healingActions = [];
                    // Rest
                    healingActions.push({name: game.i18n.localize('CAIRN.Rest'), cssClass: "toggle", id: '0', encodedValue: "status_healing|rest"});
                        
                    // Restore Abilities
                    healingActions.push({name: game.i18n.localize('CAIRN.RestoreAbilities'), cssClass: "toggle", id: '1', encodedValue: "status_healing|restore_abilities"});
                    // Add Healing Buttons
                    this.addActions(healingActions, {id: 'status_healing', type: 'system'});
                }

            }

            if (this.actor.type == "character") {
                // Inventory Status
                const invStatusActions = [];
                // Current inventory Status
                const invName = [[game.i18n.localize('CAIRN.Items'), this.actor.system.slotsUsed].join(': '), this.actor.system.slotsMax].join(' / ');
                invStatusActions.push({name: invName, id: '0', encodedValue: "status_inventory|inv_status"});

                let fatigue = this.actor.items.filter(w => w.name === game.i18n.localize('CAIRN.Fatigue'));
                const invFatigueName = [game.i18n.localize('CAIRN.Fatigue'), fatigue.length].join(': ');
                invStatusActions.push({name: invFatigueName, id: '1', cssClass: "toggle", encodedValue: "status_inventory|fatigue"});

                this.addActions(invStatusActions, {id: 'status_inventory', type: 'system'});
            }

            if (this.actor.system.biography) {
                const bioActions = [];
                const bio = game.i18n.localize('CAIRN.Description');
                bioActions.push({name: bio, cssClass: "toggle", id: '0', encodedValue: 'status_bio|bio'});
                this.addActions(bioActions, {id: 'status_bio', type: 'system'});
            }
            
        }

        buildUtilityActions() {

            if (this.actor.type == "character" || this.actor.type == "npc") {

                const utilityCombat = [];
                const endTurnAction = {
                    name: game.i18n.localize('tokenActionHud.endTurn'),
                    cssClass: "toggle",
                    encodedValue: ['utility_combat', 'endTurn'].join('|')
                }
                utilityCombat.push(endTurnAction);
                this.addActions(utilityCombat, {id: 'utility_combat', type: 'system'});

                const utilityMisc = [];
                const name = game.i18n.localize('CAIRN.DieOfFate');
                utilityMisc.push({name: name, cssClass: "toggle", id: '0', encodedValue: "utility_combat|dieOfFate"});
                this.addActions(utilityMisc, {id: 'utility_misc', type: 'system'});
                
            }

        }

        /**
         * Build multiple token actions
         * @private
         * @returns {object}
         */
        #buildMultipleTokenActions() {
        }
    }
})
