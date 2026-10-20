ServerEvents.recipes(e => {
    e.shapeless("ae2:item_p2p_tunnel", [
        "ae2:me_p2p_tunnel",
        "minecraft:hopper"
    ]).id("kubejs:mods/ae2/item_p2p_tunnel")

    e.shapeless("ae2:light_p2p_tunnel", [
        "ae2:me_p2p_tunnel",
        "minecraft:torch"
    ]).id("kubejs:mods/ae2/light_p2p_tunnel")

    e.shapeless("ae2:redstone_p2p_tunnel", [
        "ae2:me_p2p_tunnel",
        "#c:dusts/redstone"
    ]).id("kubejs:mods/ae2/redstone_p2p_tunnel")

    e.remove({ output: "ae2:me_p2p_tunnel" })
    e.shaped("ae2:me_p2p_tunnel", [
        " S ",
        "SAS",
        "FFF"
    ], {
        "S": "#c:ingots/steel",
        "A": "ae2:engineering_processor",
        "F": "ae2:fluix_crystal"
    }).id("kubejs:mods/ae2/me_p2p_tunnel")

    e.shapeless("ae2:fluix_covered_cable", [
        "ae2:fluix_glass_cable",
        "hbm:plate_polymer"
    ]).id("kubejs:mods/ae2/fluix_covered_cable")

    e.remove({ output: "ae2:spatial_io_port" })
    e.shaped("ae2:spatial_io_port", [
        "Q",
        "P",
        "C"
    ], {
        "Q": "hbm:glass_quartz",
        "P": "ae2:io_port",
        "C": "ae2:calculation_processor"
    }).id("kubejs:mods/ae2/spatial_io_port")

    e.remove({ output: "ae2:io_port" })
    e.shaped("ae2:io_port", [
        "Q",
        "D",
        "L"
    ], {
        "Q": "hbm:glass_quartz",
        "D": "ae2:drive",
        "L": "ae2:logic_processor"
    }).id("kubejs:mods/ae2/io_port")

    e.remove({ output: "ae2:energy_cell" })
    e.shaped("ae2:energy_cell", [
        "CFC",
        "FGF",
        "CFC"
    ], {
        "C": "ae2:charged_certus_quartz_crystal",
        "F": "ae2:fluix_crystal",
        "G": "hbm:glass_quartz"
    }).id("kubejs:mods/ae2/energy_cell")

    e.remove({ output: "ae2:item_cell_housing" })
    e.shaped("ae2:item_cell_housing", [
        "GGG",
        "R R",
        "TTT"
    ], {
        "G": "hbm:glass_quartz",
        "R": "#c:dusts/redstone",
        "T": "hbm:ingot_tcalloy"
    }).id("kubejs:mods/ae2/advanced_cell_housing")

    e.remove({ output: "ae2:item_cell_housing" })
    e.shaped("ae2:item_cell_housing", [
        "GGG",
        "R R",
        "SII"
    ], {
        "G": "hbm:glass_quartz",
        "R": "#c:dusts/redstone",
        "S": "#c:ingots/steel",
        "I": "hbm:ingot_steel"
    }).id("kubejs:mods/ae2/cell_housing")

    e.remove({ output: "ae2:growth_accelerator" })
    e.shaped("ae2:growth_accelerator", [
        "GCG",
        "CFC",
        "GCG"
    ], {
        "G": "#c:ingots/steel",
        "C": "ae2:fluix_glass_cable",
        "F": "ae2:fluix_block"
    }).id("kubejs:mods/ae2/growth_accelerator")

    e.remove({ output: "ae2:chest" })
    e.shaped("ae2:chest", [
        "SGS",
        "CTC",
        "SCP"
    ], {
        "S": "#c:ingots/steel",
        "G": "hbm:glass_quartz",
        "C": "ae2:fluix_glass_cable",
        "T": "ae2:terminal",
        "P": "ae2:calculation_processor"
    }).id("kubejs:mods/ae2/chest")

    e.remove({ output: "ae2:molecular_assembler" })
    e.shaped("ae2:molecular_assembler", [
        "SGS",
        "CAC",
        "SLS"
    ], {
        "S": "#c:ingots/steel",
        "G": "hbm:glass_quartz",
        "C": "ae2:fluix_glass_cable",
        "A": "hbm:machine_autocrafter",
        "L": "ae2:logic_processor"
    }).id("kubejs:mods/ae2/molecular_assembler")

    e.remove({ output: "ae2:interface" })
    e.shaped("ae2:interface", [
        "SSS",
        "CLC",
        "SSS"
    ], {
        "S": "#c:ingots/steel",
        "C": "ae2:fluix_glass_cable",
        "L": "ae2:logic_processor"
    }).id("kubejs:mods/ae2/interface")

    e.remove({ output: "ae2:blank_pattern" })
    e.shaped(Item.of('ae2:blank_pattern', 16), [
        " P ",
        "PCP",
        " P "
    ], {
        "P": "#hbm:ingots/any_hard_plastic",
        "C": "hbm:circuit_chip"
    }).id("kubejs:mods/ae2/blank_pattern_hard_plastic")

    e.remove({ output: "ae2:blank_pattern" })
    e.shaped(Item.of('ae2:blank_pattern', 4), [
        " P ",
        "PCP",
        " P "
    ], {
        "P": "#hbm:ingots/any_rubber",
        "C": "hbm:circuit_chip"
    }).id("kubejs:mods/ae2/blank_pattern_rubber")

    e.remove({ output: "ae2:network_tool" })
    e.shaped("ae2:network_tool", [
        " C ",
        "CWC",
        " C "
    ], {
        "C": "ae2:fluix_glass_cable",
        "W": "ae2:certus_quartz_wrench"
    }).id("kubejs:mods/ae2/network_tool")

    e.remove({ output: "ae2:color_applicator" })
    e.shaped("ae2:color_applicator", [
        " S ",
        "SC ",
        "  E"
    ], {
        "S": "#c:ingots/steel",
        "C": "ae2:cell_component_1k",
        "E": "ae2:energy_cell"
    }).id("kubejs:mods/ae2/color_applicator")

    e.remove({ output: "ae2:memory_card" })
    e.shaped("ae2:memory_card", [
        "CSS",
        "SRS"
    ], {
        "C": "ae2:calculation_processor",
        "R": "#c:dusts/redstone",
        "S": "#c:ingots/steel"
    }).id("kubejs:mods/ae2/memory_card")

    e.remove({ output: "ae2:charger" })
    e.shaped("ae2:charger", [
        "PGP",
        "S  ",
        "PGP"
    ], {
        "P": "#c:plates/steel",
        "G": "ae2:fluix_crystal",
        "S": "#c:ingots/steel"
    }).id("kubejs:mods/ae2/charger")

    e.remove({ output: "ae2:energy_acceptor" })
    e.shaped("ae2:energy_acceptor", [
        "PGP",
        "GFG",
        "PGP"
    ], {
        "P": "#c:plates/steel",
        "G": "ae2:fluix_crystal",
        "F": "hbm:glass_quartz"
    }).id("kubejs:mods/ae2/energy_acceptor")

    e.remove({ output: "ae2:spatial_pylon" })
    e.shaped("ae2:spatial_pylon", [
        "QCQ",
        "DFD",
        "QCQ"
    ], {
        "Q": "hbm:glass_quartz",
        "C": "ae2:fluix_glass_cable",
        "D": "ae2:fluix_dust",
        "F": "ae2:fluix_crystal"
    }).id("kubejs:mods/ae2/spatial_pylon")

    e.remove({ output: "ae2:cell_workbench" })
    e.shaped("ae2:cell_workbench", [
        "PCP",
        "SWS",
        "SSS"
    ], {
        "P": "hbm:plate_cast_steel",
        "C": "ae2:calculation_processor",
        "S": "#c:ingots/steel",
        "W": "#c:chests/wooden"
    }).id("kubejs:mods/ae2/cell_workbench")

    e.remove({ output: "ae2:quantum_ring" })
    e.shaped("ae2:quantum_ring", [
        "PEP",
        "LCL",
        "PEP"
    ], {
        "P": "hbm:plate_cast_steel",
        "E": "ae2:engineering_processor",
        "L": "ae2:logic_processor",
        "C": "ae2:energy_cell"
    }).id("kubejs:mods/ae2/quantum_ring")

    e.remove({ output: "ae2:drive" })
    e.shaped("ae2:drive", [
        "PEP",
        "C C",
        "PEP"
    ], {
        "P": "hbm:plate_cast_steel",
        "E": "ae2:engineering_processor",
        "C": "ae2:fluix_glass_cable"
    }).id("kubejs:mods/ae2/drive")

    e.remove({ output: "ae2:crafting_unit" })
    e.shaped("ae2:crafting_unit", [
        "PCP",
        "CLC",
        "PCP"
    ], {
        "P": "hbm:plate_cast_steel",
        "C": "ae2:calculation_processor",
        "L": "ae2:logic_processor"
    }).id("kubejs:mods/ae2/crafting_unit")

    e.remove({ output: "ae2:condenser" })
    e.shaped("ae2:condenser", [
        "QGQ",
        "GDF",
        "QGQ"
    ], {
        "Q": "hbm:plate_welded_steel",
        "G": "hbm:glass_quartz",
        "D": "ae2:fluix_dust",
        "F": "ae2:fluix_crystal"
    }).id("kubejs:mods/ae2/condenser")

    e.shaped(Item.of('ae2:sky_stone_block', 16), [
        " M ",
        "MCM",
        " M "
    ], {
        "M": "hbm:fragment_meteorite",
        "C": "minecraft:cobblestone"
    }).id("kubejs:mods/ae2/sky_stone_block")

    e.remove({ output: "ae2:quantum_link" })
    e.shaped("ae2:quantum_link", [
        "QPQ",
        "PCP",
        "QPQ"
    ], {
        "Q": "hbm:glass_quartz",
        "P": "ae2:fluix_pearl",
        "C": "hbm:circuit_chip_quantum"
    }).id("kubejs:mods/ae2/quantum_link")

    e.remove({ output: "ae2:terminal" })
    e.shaped("ae2:terminal", [
        "LIL"
    ], {
        "L": "ae2:logic_processor",
        "I": "ae2:semi_dark_monitor"
    }).id("kubejs:mods/ae2/terminal")

    e.remove({ output: "ae2:semi_dark_monitor" })
    e.shaped(Item.of('ae2:semi_dark_monitor', 3), [
        " GQ",
        "SRQ",
        " GQ"
    ], {
        "G": "#c:dusts/glowstone",
        "R": "#c:dusts/redstone",
        "S": "#c:ingots/steel",
        "Q": "hbm:glass_quartz"
    }).id("kubejs:mods/ae2/semi_dark_monitor")

    e.remove({ output: "ae2:import_bus" })
    e.shaped("ae2:import_bus", [
        " E ",
        "SP "
    ], {
        "E": "ae2:engineering_processor",
        "S": "#c:ingots/steel",
        "P": "minecraft:piston"
    }).id("kubejs:mods/ae2/import_bus")

    e.remove({ output: "ae2:export_bus" })
    e.shaped("ae2:export_bus", [
        "SL ",
        " P "
    ], {
        "S": "#c:ingots/steel",
        "L": "ae2:logic_processor",
        "P": "minecraft:piston"
    }).id("kubejs:mods/ae2/export_bus")

    e.remove({ output: "ae2:conversion_monitor" })
    e.shaped("ae2:conversion_monitor", [
        "ESL"
    ], {
        "E": "ae2:engineering_processor",
        "S": "ae2:storage_monitor",
        "L": "ae2:logic_processor"
    }).id("kubejs:mods/ae2/conversion_monitor")

    e.remove({ output: "ae2:formation_plane" })
    e.shaped("ae2:formation_plane", [
        "FFF",
        "PEP"
    ], {
        "F": "ae2:fluix_crystal",
        "P": "hbm:plate_cast_steel",
        "E": "ae2:engineering_processor"
    }).id("kubejs:mods/ae2/formation_plane")

    e.remove({ output: "ae2:annihilation_plane" })
    e.shaped("ae2:annihilation_plane", [
        "FFF",
        "PLP"
    ], {
        "F": "ae2:fluix_crystal",
        "P": "hbm:plate_cast_steel",
        "L": "ae2:logic_processor"
    }).id("kubejs:mods/ae2/annihilation_plane")

    e.remove({ output: "ae2:wireless_booster" })
    e.shaped("ae2:wireless_booster", [
        "FQD",
        "SSS"
    ], {
        "F": "ae2:fluix_dust",
        "Q": "ae2:certus_quartz_crystal",
        "D": "minecraft:ender_pearl",
        "S": "#c:ingots/steel"
    }).id("kubejs:mods/ae2/wireless_booster")

    e.remove({ output: "ae2:wireless_terminal" })
    e.shaped("ae2:wireless_terminal", [
        " P ",
        "SF ",
        " S "
    ], {
        "P": "ae2:fluix_pearl",
        "S": "#c:ingots/steel",
        "F": "ae2:quartz_fiber"
    }).id("kubejs:mods/ae2/wireless_terminal")

    e.remove({ output: "ae2:redstone_card" })
    e.shaped("ae2:redstone_card", [
        "BT"
    ], {
        "B": "ae2:basic_card",
        "T": "minecraft:redstone_torch"
    }).id("kubejs:mods/ae2/redstone_card")

    e.remove({ output: "ae2:basic_card" })
    e.shaped("ae2:basic_card", [
        "GS ",
        "RCS",
        "GS "
    ], {
        "G": "#c:ingots/gold",
        "S": "#c:ingots/steel",
        "R": "#c:dusts/redstone",
        "C": "ae2:calculation_processor"
    }).id("kubejs:mods/ae2/basic_card")

    e.remove({ output: "ae2:advanced_card" })
    e.shaped("ae2:advanced_card", [
        "DS ",
        "RCS",
        "DS "
    ], {
        "D": "#c:gems/diamond",
        "S": "#c:ingots/steel",
        "R": "#c:dusts/redstone",
        "C": "ae2:calculation_processor"
    }).id("kubejs:mods/ae2/advanced_card")

    e.remove({ output: "ae2:view_cell" })
    e.shaped("ae2:view_cell", [
        "QRQ",
        "RCR",
        "SSS"
    ], {
        "Q": "hbm:glass_quartz",
        "R": "#c:dusts/redstone",
        "S": "#c:ingots/steel",
        "C": "ae2:certus_quartz_crystal"
    }).id("kubejs:mods/ae2/view_cell")
})
