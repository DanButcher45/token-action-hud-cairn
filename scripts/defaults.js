/**
 * Default layout and groups
 */
export let DEFAULTS = null
let spellGroupName = '';



Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    DEFAULTS = {
        layout: [
            {
                nestId: 'action',
                id: 'action',
                name: coreModule.api.Utils.i18n("tokenActionHud.cairn.action"),
                groups: [
                    {
                        nestId: 'action_weapons',
                        id: 'action_weapons',
                        name: coreModule.api.Utils.i18n('CAIRN.Weapon'),
                        type: 'system'
                    },
                    {
                        nestId: 'action_spells',
                        id: 'action_spells',
                        name: coreModule.api.Utils.i18n('tokenActionHud.cairn.magic'),
                        type: 'system',
                    }
                ]
            },
            {
                nestId: 'inventory',
                id: 'inventory',
                name: coreModule.api.Utils.i18n('tokenActionHud.cairn.inventory'),
                groups: [
                    {
                        nestId: 'inventory_weapons',
                        id: 'inventory_weapons',
                        name: coreModule.api.Utils.i18n('TYPES.Item.weapon'),
                        type: 'system',
                    },
                    {
                        nestId: 'inventory_spells',
                        id: 'inventory_spells',
                        name: coreModule.api.Utils.i18n('TYPES.Item.spellbook'),
                        type: 'system',
                    },
                    {
                        nestId: 'inventory_armors',
                        id: 'inventory_armors',
                        name: coreModule.api.Utils.i18n('TYPES.Item.armor'),
                        type: 'system',
                    },
                    {
                        nestId: 'inventory_items',
                        id: 'inventory_items',
                        name: coreModule.api.Utils.i18n('TYPES.Item.item'),
                        type: 'system',
                    },
                    {
                        nestId: 'inventory_purse',
                        id: 'inventory_purse',
                        name: coreModule.api.Utils.i18n('tokenActionHud.cairn.purse'),
                        type: 'system',
                    }
                ]
            },
            {
                nestId: 'status',
                id: 'status',
                name: coreModule.api.Utils.i18n('tokenActionHud.cairn.info'),
                groups: [
                    {
                        nestId: 'status_saves',
                        id: 'status_saves',
                        name: coreModule.api.Utils.i18n('tokenActionHud.cairn.saves'),
                        type: 'system',
                    },
                    {
                        nestId: 'status_infos',
                        id: 'status_infos',
                        name: coreModule.api.Utils.i18n('tokenActionHud.cairn.status'),
                        type: 'system',
                    },
                    {
                        nestId: 'status_healing',
                        id: 'status_healing',
                        name: coreModule.api.Utils.i18n('tokenActionHud.cairn.healing'),
                        type: 'system',
                    },
                    {
                        nestId: 'status_inventory',
                        id: 'status_inventory',
                        name: coreModule.api.Utils.i18n('tokenActionHud.cairn.inventory'),
                        type: 'system',
                    },
                    {
                        nestId: 'status_bio',
                        id: 'status_bio',
                        name: coreModule.api.Utils.i18n('tokenActionHud.cairn.bio'),
                        type: 'system',
                    }
                ]
            },
            {
                nestId: 'utility',
                id: 'utility',
                name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
                groups: [
                    {
                        nestId: 'utility_combat',
                        id: 'utility_combat',
                        name: coreModule.api.Utils.i18n('tokenActionHud.cairn.combat'),
                        type: 'system'
                    },
                    {
                        nestId: 'utility_misc',
                        id: 'utility_misc',
                        name: coreModule.api.Utils.i18n('tokenActionHud.cairn.misc'),
                        type: 'system'
                    }
                ]
            },
        ],
        groups: [
            {id: 'action_weapons', name: coreModule.api.Utils.i18n('CAIRN.Weapon'), type: 'system'},
            {id: 'action_spells', name: coreModule.api.Utils.i18n('tokenActionHud.cairn.magic'), type: 'system'},
            {id: 'inventory_weapons', name: coreModule.api.Utils.i18n('CAIRN.Weapon'), type: 'system'},
            {id: 'inventory_spells', name: coreModule.api.Utils.i18n('CAIRN.Spellbook'), type: 'system'},
            {id: 'inventory_armors', name: coreModule.api.Utils.i18n('CAIRN.Armor'), type: 'system'},
            {id: 'inventory_items', name: coreModule.api.Utils.i18n('CAIRN.Items'), type: 'system'},
            {id: 'inventory_purse', name: coreModule.api.Utils.i18n('tokenActionHud.cairn.purse'), type: 'system'},
            {id: 'status_saves', name: coreModule.api.Utils.i18n('tokenActionHud.cairn.saves'), type: 'system'},
            {id: 'status_infos', name: coreModule.api.Utils.i18n('tokenActionHud.cairn.status'), type: 'system'},
            {id: 'status_healing', name: coreModule.api.Utils.i18n('tokenActionHud.cairn.healing'), type: 'system'},
            {id: 'status_inventory', name: coreModule.api.Utils.i18n('tokenActionHud.cairn.inventory'), type: 'system'},
            {id: 'status_bio', name: coreModule.api.Utils.i18n('tokenActionHud.cairn.bio'), type: 'system'},
            {id: 'utility_combat', name: coreModule.api.Utils.i18n('tokenActionHud.cairn.combat'), type: 'system'},
            {id: 'utility_misc', name: coreModule.api.Utils.i18n('tokenActionHud.cairn.misc'), type: 'system'}
        ]
    }
})
