class WorldState:
    """
    Manages the game world: biomes, enemies, and environmental data
    """

    def __init__(self):
        self.biomes = self._initialize_biomes()
        self.enemy_types = self._initialize_enemies()

    def _initialize_biomes(self):
        """Define all zoo biomes"""
        return {
            "LanternAviary": {
                "name": "Lantern Aviary",
                "description": "Moonlit rafters and suspended cages shimmering with drifting feathers.",
                "lighting": "dusklit",
                "hazards": ["shifting rafters", "falling lantern glass"],
                "atmosphere": "hushed",
                "enemies": ["Nyx, Owl Warden"],
                "color_palette": ["#05060f", "#1b2440", "#3c5e7f"]
            },
            "Serpentarium": {
                "name": "Shattered Serpentarium",
                "description": "Cracked terrarium panes leak fog where serpents once basked.",
                "lighting": "veiled",
                "hazards": ["venom pools", "lash traps"],
                "atmosphere": "tense",
                "enemies": ["Vey, Serpent Matron"],
                "color_palette": ["#090c13", "#1d2a2a", "#35534b"]
            },
            "TidePens": {
                "name": "Tideworn Pens",
                "description": "Flooded walkways echo with the crash of distant waves.",
                "lighting": "misty",
                "hazards": ["tidal surges", "slippery grates"],
                "atmosphere": "brumal",
                "enemies": ["Oran, Leviathan Seal"],
                "color_palette": ["#04070e", "#14253f", "#1e3f61"]
            },
            "ThornSanctum": {
                "name": "Thornbound Conservatory",
                "description": "Vines knot around shattered glass, choking moonbeams to a murmur.",
                "lighting": "dappled",
                "hazards": ["snaring vines", "spore clouds"],
                "atmosphere": "foreboding",
                "enemies": ["Maul, Briar Bear"],
                "color_palette": ["#06060b", "#1f2421", "#3c4a30"]
            },
            "CrownChamber": {
                "name": "Crown of Bars",
                "description": "The final menagerie dais crowned by iron bars and spectral fire.",
                "lighting": "auroral",
                "hazards": ["cracking pillars", "resonant roars"],
                "atmosphere": "imperious",
                "enemies": ["Rex, Lion Regent"],
                "color_palette": ["#08060a", "#241830", "#3d2748"]
            }
        }

    def _initialize_enemies(self):
        """Define all enemy types and their characteristics"""
        return {
            "Nyx, Owl Warden": {
                "type": "Nyx, Owl Warden",
                "description": "A spectral owl whose lantern talons test fledgling tacticians.",
                "health": 65,
                "speed": "measured",
                "attack_pattern": "Lantern dive followed by sweeping talon arcs",
                "weakness": "Tires after prolonged air time",
                "abilities": ["Lantern Dive", "Echo Sweep", "Feather Flare"],
                "aggression": 42,
                "intelligence": 71
            },
            "Vey, Serpent Matron": {
                "type": "Vey, Serpent Matron",
                "description": "Keeper of the shattered terrarium who lashes with venomous precision.",
                "health": 110,
                "speed": "coiled bursts",
                "attack_pattern": "Venom spray, tail sweep, constrict",
                "weakness": "Recovery frames after tail slams",
                "abilities": ["Venom Spray", "Glass Lash", "Constrict"],
                "aggression": 58,
                "intelligence": 68
            },
            "Oran, Leviathan Seal": {
                "type": "Oran, Leviathan Seal",
                "description": "A colossal seal who surges across the flooded pens in rhythmic waves.",
                "health": 145,
                "speed": "surging",
                "attack_pattern": "Wave crash and rolling maul",
                "weakness": "Exposed belly after rolling charge",
                "abilities": ["Wave Crash", "Tidal Roar", "Rolling Maul"],
                "aggression": 66,
                "intelligence": 54
            },
            "Maul, Briar Bear": {
                "type": "Maul, Briar Bear",
                "description": "An armored bear woven with thorned vines that lash on command.",
                "health": 190,
                "speed": "stalking",
                "attack_pattern": "Vine snare, armored slam, pollen roar",
                "weakness": "Slow to pivot mid-charge",
                "abilities": ["Vine Snare", "Armored Slam", "Pollen Roar"],
                "aggression": 74,
                "intelligence": 61
            },
            "Rex, Lion Regent": {
                "type": "Rex, Lion Regent",
                "description": "The final sovereign whose roar fractures stone and morale alike.",
                "health": 250,
                "speed": "regal pounce",
                "attack_pattern": "Roar shockwave, claw combo, aerial maul",
                "weakness": "Briefly exposed after roar crescendos",
                "abilities": ["Crown Roar", "Imperial Maul", "Celestial Pounce"],
                "aggression": 86,
                "intelligence": 79
            }
        }

    def get_biome(self, biome_name):
        """Get information about a specific biome"""
        return self.biomes.get(biome_name, {
            "name": "Unknown",
            "description": "Uncharted territory",
            "lighting": "normal",
            "hazards": [],
            "atmosphere": "neutral",
            "enemies": [],
            "color_palette": ["#333333", "#444444", "#555555"]
        })

    def get_enemy_types(self):
        """Get all enemy types"""
        return self.enemy_types

    def get_enemy_info(self, enemy_type):
        """Get detailed information about a specific enemy"""
        return self.enemy_types.get(enemy_type, {
            "type": "Unknown",
            "description": "Unknown creature",
            "health": 100,
            "speed": "medium",
            "attack_pattern": "Unpredictable",
            "weakness": "Unknown",
            "abilities": [],
            "aggression": 50,
            "intelligence": 50
        })

    def get_biome_enemies(self, biome_name):
        """Get enemies that appear in a specific biome"""
        biome = self.get_biome(biome_name)
        enemy_names = biome.get('enemies', [])

        return [self.get_enemy_info(enemy) for enemy in enemy_names]
