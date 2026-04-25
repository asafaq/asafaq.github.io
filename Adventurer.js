	class Adventurer {
		name: string;
		race: string;
		role: string;
		hp_die: number;
		hp_modifier: number;
		alignment: string;
		level: number;
		sex: number;
		size: string;
		caste: string;
		RacialEnemy: string;
		proficiency_armor: string;
		proficiency_weapon: string;
		inventory1: string;
		inventory2: string;
		inventory3: string;
		inventory4: string;
		trait1: string;
		trait2: string;
		trait3: string;
		trait4: string;
		trait5: string;
		trait6: string;
		notes: string;

		constructor(name: string, role: string, alignment: string, level: number, sex: number, size: string, caste: string, inventory1: string, inventory2: string, inventory3: string, inventory4: string, trait1: string, trait2: string, trait3: string, trait4: string, trait5: string, trait6: string) {
			this.name = name;
			this.role = role;
			this.level = level;
			this.alignment = alignment;
			this.sex = sex;
			this.size = size;
			this.caste = caste;
			this.inventory1 = inventory1;
			this.inventory2 = inventory2;
			this.inventory3 = inventory3;
			this.inventory4 = inventory4;
			this.trait1 = trait1;
			this.trait2 = trait2;
			this.trait3 = trait3;
			this.trait4 = trait4;
			this.trait5 = trait5;
			this.trait6 = trait6;
		}

		describe() {
			return `${this.name} the ${this.role} (Level ${this.level})`;
		}
	}

(window as any).Adventurer = Adventurer;