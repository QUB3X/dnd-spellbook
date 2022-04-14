import { Spellbook as DbSpellbook } from "@prisma/client"
import { Spellbook } from "../types/Spellbook"

export function parseSpellbook(spellbook: DbSpellbook): Spellbook {
	console.log(spellbook)

	return {
		id: spellbook.id,
		last_updated: new Date(spellbook.last_updated),
		title: spellbook.title,
		spellIds: (JSON.parse(spellbook.spells as string) as string[]) ?? [],
	}
}
