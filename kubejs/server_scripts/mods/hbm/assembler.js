ServerEvents.recipes(e => {
    e.remove({ output: "ae2:cell_component_1k" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "ingredient": "hbm:circuit_basic"
            },
            {
                "count": 8,
                "ingredient": "#c:fine_wires/copper"
            }
        ],
        "name": "ass.1kstorage",
        "order": 510,
        "output_items": [
            "ae2:cell_component_1k"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_1kstorage")

    e.remove({ output: "ae2:cell_component_4k" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "count": 4,
                "ingredient": "hbm:circuit_basic"
            },
            {
                "count": 16,
                "ingredient": "#c:fine_wires/copper"
            }
        ],
        "name": "ass.4kstorage",
        "order": 511,
        "output_items": [
            "ae2:cell_component_4k"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_4kstorage")

    e.remove({ output: "ae2:cell_component_16k" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "ingredient": "hbm:circuit_advanced"
            },
            {
                "count": 24,
                "ingredient": "#c:fine_wires/lead"
            }
        ],
        "name": "ass.16kstorage",
        "order": 512,
        "output_items": [
            "ae2:cell_component_16k"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_16kstorage")

    e.remove({ output: "ae2:cell_component_64k" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "count": 4,
                "ingredient": "hbm:circuit_advanced"
            },
            {
                "count": 32,
                "ingredient": "#c:fine_wires/lead"
            }
        ],
        "name": "ass.64kstorage",
        "order": 513,
        "output_items": [
            "ae2:cell_component_64k"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_64kstorage")

    e.remove({ output: "ae2:cell_component_256k" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "ingredient": "hbm:circuit_bismoid"
            },
            {
                "count": 48,
                "ingredient": "#c:fine_wires/gold"
            }
        ],
        "name": "ass.256kstorage",
        "order": 514,
        "output_items": [
            "ae2:cell_component_256k"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_256kstorage")

    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "ingredient": "hbm:circuit_controller_quantum"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            },
            {
                "count": 64,
                "ingredient": "#c:fine_wires/magnetized_tungsten"
            },
            {
                "count": 24,
                "ingredient": "#c:fine_wires/magnetized_tungsten"
            }
        ],
        "name": "ass.Singularitystorage",
        "order": 515,
        "output_items": [
            "ae2:singularity"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_Singularitystorage")

    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "ingredient": "hbm:circuit_controller_quantum"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            },
            {
                "count": 64,
                "ingredient": "#c:fine_wires/magnetized_tungsten"
            },
            {
                "count": 32,
                "ingredient": "#c:fine_wires/magnetized_tungsten"
            }
        ],
        "name": "ass.Universestorage",
        "order": 516,
        "output_items": [
            "ae2:creative_storage_cell"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_Universestorage")

    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "ingredient": "hbm:circuit_chip_quantum"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            },
            {
                "count": 64,
                "ingredient": "#c:fine_wires/magnetized_tungsten"
            }
        ],
        "name": "ass.Quantumstorage",
        "order": 517,
        "output_items": [
            "ae2:quantum_entangled_singularity"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_Quantumstorage")

    e.remove({ output: "ae2:spatial_cell_component_2" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "ingredient": "ae2:fluix_pearl"
            },
            {
                "ingredient": "hbm:circuit_basic"
            },
            {
                "count": 8,
                "ingredient": "#c:fine_wires/lead"
            }
        ],
        "name": "ass.2spatial",
        "order": 518,
        "output_items": [
            "ae2:spatial_cell_component_2"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_2spatial")

    e.remove({ output: "ae2:spatial_cell_component_16" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "ingredient": "ae2:fluix_pearl"
            },
            {
                "ingredient": "hbm:circuit_advanced"
            },
            {
                "count": 8,
                "ingredient": "#c:fine_wires/lead"
            },
            {
                "ingredient": "#hbm:ingots/any_resistant_alloy"
            }
        ],
        "name": "ass.16spatial",
        "order": 519,
        "output_items": [
            "ae2:spatial_cell_component_16"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_16spatial")

    e.remove({ output: "ae2:spatial_cell_component_128" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "ingredient": "ae2:fluix_pearl"
            },
            {
                "ingredient": "hbm:circuit_bismoid"
            },
            {
                "count": 8,
                "ingredient": "#c:fine_wires/lead"
            },
            {
                "count": 2,
                "ingredient": "#hbm:ingots/any_resistant_alloy"
            }
        ],
        "name": "ass.128spatial",
        "order": 520,
        "output_items": [
            "ae2:spatial_cell_component_128"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_128spatial")

    e.remove({ output: "ae2:cell_component_256k" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "count": 4,
                "ingredient": "hbm:circuit_bismoid"
            },
            {
                "count": 64,
                "ingredient": "#c:fine_wires/gold"
            }
        ],
        "name": "ass.1024kstorage",
        "order": 521,
        "output_items": [
            "ae2:cell_component_256k"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_1024kstorage")

    e.remove({ output: "ae2:cell_component_256k" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "ingredient": "hbm:circuit_quantum"
            },
            {
                "count": 64,
                "ingredient": "#c:fine_wires/magnetized_tungsten"
            },
            {
                "count": 8,
                "ingredient": "#c:fine_wires/magnetized_tungsten"
            }
        ],
        "name": "ass.4096kstorage",
        "order": 522,
        "output_items": [
            "ae2:cell_component_256k"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_4096kstorage")

    e.remove({ output: "ae2:cell_component_256k" })
    e.custom({
        "type": "hbm:assembly_machine",
        "duration": 200,
        "input_items": [
            {
                "count": 4,
                "ingredient": "#c:plates/steel"
            },
            {
                "count": 4,
                "ingredient": "ae2:certus_quartz_crystal"
            },
            {
                "count": 4,
                "ingredient": "hbm:circuit_quantum"
            },
            {
                "count": 64,
                "ingredient": "#c:fine_wires/magnetized_tungsten"
            },
            {
                "count": 16,
                "ingredient": "#c:fine_wires/magnetized_tungsten"
            }
        ],
        "name": "ass.16384kstorage",
        "order": 523,
        "output_items": [
            "ae2:cell_component_256k"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/ass_16384kstorage")
})
