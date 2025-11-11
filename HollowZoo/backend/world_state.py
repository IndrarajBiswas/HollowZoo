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
            "RooSanctum": {
                "name": "Roo Sanctum",
                "description": "The main kangaroo habitat, now overrun with aggressive AI kangaroos",
                "lighting": "dim",
                "hazards": ["spike pits", "unstable platforms"],
                "atmosphere": "eerie",
                "enemies": ["Scout Roo", "Alpha Kangaroo", "Roo Brute"],
                "color_palette": ["#2a1a1f", "#4a3a3f", "#6a5a5f"]
            },
            "DesertDome": {
                "name": "Desert Dome",
                "description": "A simulated desert environment with harsh lighting and sand traps",
                "lighting": "bright",
                "hazards": ["quicksand", "heat vents"],
                "atmosphere": "harsh",
                "enemies": ["Desert Roo", "Sand Striker"],
                "color_palette": ["#c4a573", "#8b7355", "#d4af37"]
            },
            "AquaVault": {
                "name": "Aqua Vault",
                "description": "Flooded underground aquarium with limited visibility",
                "lighting": "low",
                "hazards": ["deep water", "electric currents"],
                "atmosphere": "claustrophobic",
                "enemies": ["Aqua Roo", "Tide Jumper"],
                "color_palette": ["#1a3a4a", "#2a4a5a", "#3a5a6a"]
            },
            "ThornGarden": {
                "name": "Thorn Garden",
                "description": "Overgrown botanical section with dangerous flora",
                "lighting": "filtered",
                "hazards": ["thorny vines", "poison spores"],
                "atmosphere": "overgrown",
                "enemies": ["Garden Roo", "Thorn Hopper"],
                "color_palette": ["#2a4a2a", "#3a5a3a", "#1a3a1a"]
            },
            "KingsChamber": {
                "name": "King's Chamber",
                "description": "The central chamber where the Kangaroo King resides",
                "lighting": "dramatic",
                "hazards": ["collapsing ceiling", "energy barriers"],
                "atmosphere": "ominous",
                "enemies": ["Kangaroo King"],
                "color_palette": ["#4a1a2a", "#6a2a3a", "#8a3a4a"]
            }
        }

    def _initialize_enemies(self):
        """Define all enemy types and their characteristics"""
        return {
            "Scout Roo": {
                "type": "Scout Roo",
                "description": "Fast, lightweight kangaroo that focuses on quick jabs",
                "health": 60,
                "speed": "high",
                "attack_pattern": "Quick double-jab then retreat",
                "weakness": "Low defense, vulnerable after attacks",
                "abilities": ["Quick Jab", "Retreat Hop"],
                "aggression": 70,
                "intelligence": 50
            },
            "Alpha Kangaroo": {
                "type": "Alpha Kangaroo",
                "description": "Balanced fighter with strong kicks and tactical awareness",
                "health": 100,
                "speed": "medium",
                "attack_pattern": "Jump attack followed by ground pound",
                "weakness": "Predictable landing spots",
                "abilities": ["Jump Attack", "Ground Pound", "Tail Sweep"],
                "aggression": 60,
                "intelligence": 70
            },
            "Roo Brute": {
                "type": "Roo Brute",
                "description": "Heavy, slow kangaroo with devastating power",
                "health": 150,
                "speed": "low",
                "attack_pattern": "Charge attack and heavy slams",
                "weakness": "Slow turn speed, long recovery times",
                "abilities": ["Charge", "Heavy Slam", "Shockwave"],
                "aggression": 80,
                "intelligence": 40
            },
            "Desert Roo": {
                "type": "Desert Roo",
                "description": "Heat-adapted kangaroo with sand-based attacks",
                "health": 80,
                "speed": "high",
                "attack_pattern": "Sand kick then aerial dive",
                "weakness": "Needs space to maneuver",
                "abilities": ["Sand Kick", "Aerial Dive", "Mirage"],
                "aggression": 65,
                "intelligence": 60
            },
            "Aqua Roo": {
                "type": "Aqua Roo",
                "description": "Amphibious kangaroo with water manipulation",
                "health": 90,
                "speed": "medium",
                "attack_pattern": "Splash attack then underwater retreat",
                "weakness": "Weaker on dry land",
                "abilities": ["Splash Attack", "Water Jet", "Dive"],
                "aggression": 50,
                "intelligence": 65
            },
            "Garden Roo": {
                "type": "Garden Roo",
                "description": "Kangaroo that uses plant-based attacks",
                "health": 70,
                "speed": "medium",
                "attack_pattern": "Thorn throw then vine entangle",
                "weakness": "Fire-based attacks",
                "abilities": ["Thorn Throw", "Vine Entangle", "Pollen Cloud"],
                "aggression": 55,
                "intelligence": 70
            },
            "Kangaroo King": {
                "type": "Kangaroo King",
                "description": "Boss - Massive AI kangaroo with all abilities",
                "health": 300,
                "speed": "medium",
                "attack_pattern": "Multi-phase combat with varying strategies",
                "weakness": "Overconfident, can be baited",
                "abilities": [
                    "Royal Charge",
                    "Aerial Devastation",
                    "Summon Guards",
                    "King's Roar",
                    "Adaptive Counter"
                ],
                "aggression": 75,
                "intelligence": 90
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
