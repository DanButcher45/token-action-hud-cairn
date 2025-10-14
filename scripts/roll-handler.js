export let RollHandler = null
import { evaluateFormula, formatString } from '/systems/cairn/module/utils.js'

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
     */
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        /**
         * Handle action event
         * Called by Token Action HUD Core when an action event is triggered
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionClick(event, encodedValue) {
            const payload = encodedValue.split('|')

            if (payload.length !== 2) {
                super.throwInvalidValueErr()
            }

            const actionTypeId = payload[0]
            const actionId = payload[1]

            const renderable = ['item']

            if (renderable.includes(actionTypeId) && this.isRenderItem()) {
                return this.doRenderItem(this.actor, actionId)
            }

            const knownCharacters = ['character']

            // If single actor is selected
            if (this.actor) {
                await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId)
                return
            }

            const controlledTokens = canvas.tokens.controlled
                .filter((token) => knownCharacters.includes(token.actor?.type))

            // If multiple actors are selected
            for (const token of controlledTokens) {
                const actor = token.actor
                await this.#handleAction(event, actor, token, actionTypeId, actionId)
            }
        }

        /**
         * Handle action
         * @private
         * @param {object} event        The event
         * @param {object} actor        The actor
         * @param {object} token        The token
         * @param {string} actionTypeId The action type id
         * @param {string} actionId     The actionId
         */
        async #handleAction(event, actor, token, actionTypeId, actionId) {
            const options = {};
            switch (actionTypeId) {

                case 'action_weapons':
                    this.#handleWeaponAction(event, actor, actionId);
                    break;

                case 'action_spells':
                    await this.#handleSpellAction(event, actor, actionId);
                    break;

                case 'inventory_weapons':
                case 'inventory_spells':
                case 'inventory_armors':
                    await this.#handleToggleEquippedItem(event, actor, actionId);
                    break;

                case 'inventory_items':
                    await this.#handleInvItemsClick(event, actor, actionId);
                    break;
                    
                case 'inventory_purse':
                    break;
                    
                case 'status_infos':
                    await this.#handleStatusInfos(event, actor, actionId);
                    break;
                    
                case 'status_healing':
                    await this.#handleStatusInfos(event, actor, actionId);
                    break;

                case 'status_saves':
                    await this.#handleSaves(event, actor, actionId);
                    break;
                    
                case 'status_bio':
                    this.#handleBioAction(event, actor, actionId);
                    break;

                case 'status_inventory':
                    if (actionId == "fatigue") {
                        this.#handleFatigueAction(event, actor, actionId);
                    }
                    break;
                    
                case 'utility_misc':
                    await this.#handleDieOfFate(event, actor, actionId);
                    break;

                case 'utility_combat':
                    await this.#handleUtilityAction(token, actionId);
                    break;
            }
        }

        async #handleFatigueAction(event, actor, actionId) {
            if (event.button == 2) {
                // Right Click to remove Fatigue
                const fatigues = actor.items.filter(i => i.name === game.i18n.localize("CAIRN.Fatigue"));
                if (fatigues.length > 0) {
                    const fatigue = fatigues[0];
                    actor.deleteOwnedItem(fatigue._id);
                    Hooks.callAll('forceUpdateTokenActionHud');
                }
            }
            else {
                // Left Click to add Fatigue
                actor.createOwnedItem({
                  name: game.i18n.localize("CAIRN.Fatigue"),
                  img: 'systems/cairn/tokens/extra/fatigue-alt.webp',
                  type: 'item'
                });
                Hooks.callAll('forceUpdateTokenActionHud');
            }
        }

        async #handleInvItemsClick(event, actor, actionId) {
            const item = actor.items.get(actionId);
            if (item.system.uses.max > 0) {
                if (event.button == 2) {
                    if (item.system.uses.value < item.system.uses.max) {
                        item.system.uses.value++;
                        await item.update({'system.uses.value': item.system.uses.value});
                        Hooks.callAll('forceUpdateTokenActionHud');
                    }
                }
                else {
                    if (item.system.uses.value > 0) {
                        item.system.uses.value--;
                        await item.update({'system.uses.value': item.system.uses.value});
                        Hooks.callAll('forceUpdateTokenActionHud');
                    }
                }
            }
        }

        async #handleInvItems(event, actor, actionId, op) {
            if (op == "+") {
                const item = actor.items.get(actionId);
                if (item.system.uses.value < item.system.uses.max) {
                    item.system.uses.value++;
                    await item.update({'system.uses.value': item.system.uses.value});
                    Hooks.callAll('forceUpdateTokenActionHud');
                }
            }
            else if (op == "-") {
                const item = actor.items.get(actionId);
                if (item.system.uses.value > 0) {
                    item.system.uses.value--;
                    await item.update({'system.uses.value': item.system.uses.value});
                    Hooks.callAll('forceUpdateTokenActionHud');
                }
            }
        }

        async #handleStatusInfos(event, actor, actionId) {
            switch (actionId) {
                case 'deprived':
                    await actor.update({'system.deprived': actor.system.deprived == true ? false : true});
                    break;
                case 'panicked':
                    await actor.update({'system.hp.value': 0});
                    await actor.update({'system.panicked': actor.system.panicked == true ? false : true});
                    break;
                case 'rest':
                    if ((game.settings.get("cairn", "use-panic") == true) && actor.system.panicked != null && actor.system.panicked == true) {
                        // Character cannot rest when panicked
                        break;
                    }
                    if (actor.system.hp.value < actor.system.hp.max && ((actor.system.encumbered == null) || (actor.system.encumbered == false))) {
                        await actor.update({'system.hp.value': actor.system.hp.value = actor.system.hp.max});
                    }
                    break;
                case 'restore_abilities':
                    if (actor.system.abilities.STR.value < actor.system.abilities.STR.max) {
                        await actor.update({'system.abilities.STR.value': actor.system.abilities.STR.value = actor.system.abilities.STR.max});
                    }
                    if (actor.system.abilities.DEX.value < actor.system.abilities.DEX.max) {
                        await actor.update({'system.abilities.DEX.value': actor.system.abilities.DEX.value = actor.system.abilities.DEX.max});
                    }
                    if (actor.system.abilities.WIL.value < actor.system.abilities.WIL.max) {
                        await actor.update({'system.abilities.WIL.value': actor.system.abilities.WIL.value = actor.system.abilities.WIL.max});
                    }
                    break;
            }
            Hooks.callAll('forceUpdateTokenActionHud');
        }

        async #handleDieOfFate(event, actor, actionId) {
        }

        async #handleToggleEquippedItem(event, actor, actionId) {
            const item = actor.items.get(actionId);
            if (item.system.equipped == true)
                await item.update({'system.equipped': item.system.equipped = false});
            else
                await item.update({'system.equipped': item.system.equipped = true});
            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Handle weapon action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        
        async #handleWeaponAction(event, actor, actionId) {
            event.preventDefault();
            const element = event.currentTarget;
            //const dataset = element.dataset;
            const item = actor.items.get(actionId);
            if (item.system.damageFormula) {
                let formula;
                if ((actor.type == "character") && (game.settings.get("cairn", "use-panic") == true) && (actor.system.panicked != null) && (actor.system.panicked == true)) {
                    // Attacks of Panicked Character are impaired to 1d4 damage
                    formula = "1d4";
                }
                else {
                    formula = item.system.damageFormula;
                }
                const roll = await evaluateFormula(formula, actor.getRollData());
                const label = item.name ? game.i18n.localize("CAIRN.RollingDmgWith") + ` ${item.name}` : "";

                const targetedTokens = Array.from(game.user.targets).map(t => t.id);

                let targetIds;
                if (targetedTokens.length == 0) targetIds = null;
                else if (targetedTokens.length == 1) targetIds = targetedTokens[0];
                else {
                    targetIds = targetedTokens[0];
                    for (let index = 1; index < targetedTokens.length; index++) {
                        const element = targetedTokens[index];
                        targetIds = targetIds.concat(";",element);
                    }
                }

                this._buildDamageRollMessage(label, targetIds).then(msg => {
                  roll.toMessage({
                      speaker: ChatMessage.getSpeaker({ actor: actor }),
                      flavor: msg
                  });
                });
            }
        }
        
        _buildDamageRollMessage(label, targetIds) {
            const rollMessageTpl = 'systems/cairn/templates/chat/dmg-roll-card.html';   
            const tplData = {label: label, targets: targetIds};
            return renderTemplate(rollMessageTpl, tplData);
        }

        /**
         * Handle spell action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleSpellAction(event, actor, actionId) {
            //let label = game.i18n.localize("tokenActionHud.cairn.magic");
            const item = actor.items.get(actionId);
            // Display Spell Description in Chat
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                content: `<table><tr><td style="width: 12%"><img src=${item.img} style="border: 0px"></td><td><div style="margin-left: 5px;">${item.name}</div></td></tr></table>${item.system.description}`
            });
            if (actor.system.deprived == true) {
                // Character casting spell while deprived, roll WIL save
                this.#handleSaves(event, actor, "WIL");
            }
        }

        /**
         * Handle bio action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleBioAction(event, actor, actionId) {
            const Background = game.i18n.localize("CAIRN.Background");
            const Role = game.i18n.localize("CAIRN.Role");
            const Description = game.i18n.localize("CAIRN.Description");
            //let content = actor.type == 'npc' ? `<b>${Description}:</b><br>${actor.system.biography}` : `<b>${Background}:</b> ${actor.system.background}<hr/><b>${Description}:</b><p>${actor.system.biography}</p>`;
            let content = "";
            if ((actor.system.background != null) && (actor.system.background != "")) {
                content = content.concat(actor.type == 'npc' ? `<p><b>${Role}:</b>` : `<p><b>${Background}:</b>`);
                //content = content.concat(` ${actor.system.background}<hr/>`);
                content = content.concat(` ${actor.system.background}</p>`);
            }
            if ((actor.system.biography != null) && (actor.system.biography != "")) {
                content = content.concat(`<b>${Description}:</b><br><p>${actor.system.biography}</p>`);
            }
            else if ((actor.system.description != null) && (actor.system.description != "")) {
                content = content.concat(`<b>${Description}:</b><br>${actor.system.description}`);
            }
            if ((actor.system.notes != null) && (actor.system.notes != "")) {
                const Notes = game.i18n.localize("CAIRN.Notes");
                //content = content.concat(`<hr/><b>${Notes}:</b>${actor.system.notes}`);
                content = content.concat(`<b>${Notes}:</b>${actor.system.notes}`);
            }
            if (event.button == 2) {
                // Right-Click: Display Bio in Chat Messages
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor: actor }),
                    content: content,
                    whisper: [game.user.id],
                });
            }
            else {
                // Left-Click: Display Bio in Popup Dialog
                let d = new Dialog({
                    title: `${actor.name}`,
                    content: content,
                    buttons: {
                        close: {
                            icon: "<i class='fas fa-check'></i>",
                            label: `Close`
                        },
                    },
                    default: "close",
                    close: () => {}
                });
                d.render(true);
            }
        }

        /**
         * Handle Saves
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleSaves(event, actor, actionId) {
            const formula = 'd20cs<=@abilities.' + actionId + '.value';
            const roll = await evaluateFormula(formula, actor.getRollData());
            const label = game.i18n.format("CAIRN.Rolling") + ' ' + game.i18n.format("CAIRN.Save", { key: game.i18n.localize(actionId) });
            const rolled = roll.terms[0].results[0].result;
            const result = roll.total === 0 ? game.i18n.localize("CAIRN.Fail") : game.i18n.localize("CAIRN.Success");
            const resultCls = roll.total === 0 ? "failure" : "success";
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                flavor: label,
                content: `<div class="dice-roll"><div class="dice-result"><div class="dice-formula">${roll.formula}</div><div class="dice-tooltip" style="display: none;"><section class="tooltip-part"><div class="dice"><header class="part-header flexrow"><span class="part-formula">${roll.formula}</span></header><ol class="dice-rolls"><li class="roll die d20">${rolled}</li></ol></div></section></div><h4 class="dice-total ${resultCls}">${result} (${rolled})</h4</div></div>`,
            });
        }

        /**
         * Handle utility action
         * @private
         * @param {object} token    The token
         * @param {string} actionId The action id
         */
        async #handleUtilityAction(token, actionId) {
            switch (actionId) {
                case 'dieOfFate':
                    const roll = await evaluateFormula("1d6");
                    const rolled = roll.terms[0].results[0].result;
                    const result = roll.total > 3 ? game.i18n.localize("tokenActionHud.cairn.good") : game.i18n.localize("tokenActionHud.cairn.bad");
                    const resultCls = roll.total > 3 ? "success" : "failure";
                    roll.toMessage({
                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                        flavor: game.i18n.localize("CAIRN.DieOfFate"),
                        content: `<div class="dice-roll"><div class="dice-result"><div class="dice-formula">${roll.formula}</div><div class="dice-tooltip" style="display: none;"><section class="tooltip-part"><div class="dice"><header class="part-header flexrow"><span class="part-formula">${roll.formula}</span></header><ol class="dice-rolls"><li class="roll die d20">${rolled}</li></ol></div></section></div><h4 class="dice-total ${resultCls}">${result} (${rolled})</h4</div></div>`,
                    });
                    break;
                case 'endTurn':
                    if (game.combat?.current?.tokenId === token.id) {
                        await game.combat?.nextTurn()
                    }
                    break
            }
        }
    }
})
