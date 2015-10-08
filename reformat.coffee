#!/usr/bin/env coffee

prototypes = [
	# id, name, type, class, kind, strength, coverage, damage
	[ 1, 'Железный шлем драконопоклонника', 'hat', null, null, 280, 10, null ]
	[ 2, 'Стальной шлем драконопоклонника', 'hat', null, null, 340, 10, null ]
	[ 3, 'Закрытый стальной шлем', 'hat', null, null, 500, 13, null ]
	[ 4, 'Стальной гладиаторский шлем', 'hat', null, null, 505, 13, null ]
	[ 5, 'Гладиаторский шлем из дюрали', 'hat', null, null, 580, 13, null ]
	[ 6, 'Железный топхелм', 'hat', null, null, 320, 12, null ]
	[ 7, 'Простой рогатый шлем', 'hat', null, null, 200, 6, null ]
	[ 8, 'Шипованный правый наплечник', 'pouldron-right', null, null, 480, 8, null ]
	[ 27, 'Железный правый наплечник', 'pouldron-right', null, null, 300, 10, null ]
	[ 9, 'Кожаные сапоги хуманов', 'boots', null, null, 100, 10, null ]
	[ 10, 'Кожаные сапоги урук-хаев', 'boots', null, null, 100, 10, null ]
	[ 11, 'Кожаные сапоги эльфов', 'boots', null, null, 100, 10, null ]
	[ 12, 'Укреплённый деревянный щит', 'shield', null, null, 440, 34, null ]
	[ 13, 'Короткий эльфийский меч', 'weapon-one-handed', 'normal', 'sword', 500, null, 70 ]
	[ 14, 'Стандартный эльфийский меч', 'weapon-one-handed', 'normal', 'sword', 750, null, 105 ]
	[ 15, 'Прямой стандартный эльфийский клинок', 'weapon-one-handed', 'normal', 'sword', 550, null, 90 ]
	[ 16, 'Zweihander', 'weapon-two-handed', 'normal', 'sword', 1750, null, 190 ]
	[ 17, 'Тяжелый тесак', 'weapon-one-handed', 'short', 'dagger', 450, null, 80 ]
	[ 18, 'Шипованная дубина', 'weapon-one-handed', 'normal', 'mace', 350, null, 90 ]
	[ 19, 'Посох шамана', 'weapon-two-handed', 'normal', 'staff', 350, null, 35 ]
	[ 20, 'Деревянный посох', 'weapon-two-handed', 'normal', 'staff', 300, null, 25 ]
	[ 21, 'Усиленный меч', 'weapon-one-handed', 'normal', 'sword', 475, null, 75 ]
	[ 22, 'Стальной меч странника', 'weapon-one-handed', 'normal', 'sword', 505, null, 70 ]
	[ 23, 'Деревянная дубина', 'weapon-two-handed', 'normal', 'mace', 200, null, 105 ]
	[ 24, 'Простой железный меч', 'weapon-one-handed', 'normal', 'sword', 305, null, 65 ]
	[ 25, 'Коготь смерти', 'weapon-one-handed', 'normal', 'sword', 705, null, 140 ]
	[ 26, 'Тесак', 'weapon-one-handed', 'short', 'dagger', 205, null, 45 ]
]

data = []

for i in prototypes
	data.push
		_deleted: false
		id: i[0]
		name: i[1]
		type: i[2]
		class: i[3]
		kind: i[4]
		strength_max: i[5]
		coverage: i[6]
		damage: i[7]

console.log JSON.stringify data

# [{"_deleted":false,"id":1,"name":"Железный шлем драконопоклонника","type":"hat","class":null,"kind":null,"strength_max":280,"coverage":10,"damage":null},{"_deleted":false,"id":2,"name":"Стальной шлем драконопоклонника","type":"hat","class":null,"kind":null,"strength_max":340,"coverage":10,"damage":null},{"_deleted":false,"id":3,"name":"Закрытый стальной шлем","type":"hat","class":null,"kind":null,"strength_max":500,"coverage":13,"damage":null},{"_deleted":false,"id":4,"name":"Стальной гладиаторский шлем","type":"hat","class":null,"kind":null,"strength_max":505,"coverage":13,"damage":null},{"_deleted":false,"id":5,"name":"Гладиаторский шлем из дюрали","type":"hat","class":null,"kind":null,"strength_max":580,"coverage":13,"damage":null},{"_deleted":false,"id":6,"name":"Железный топхелм","type":"hat","class":null,"kind":null,"strength_max":320,"coverage":12,"damage":null},{"_deleted":false,"id":7,"name":"Простой рогатый шлем","type":"hat","class":null,"kind":null,"strength_max":200,"coverage":6,"damage":null},{"_deleted":false,"id":8,"name":"Шипованный правый наплечник","type":"pouldron-right","class":null,"kind":null,"strength_max":480,"coverage":8,"damage":null},{"_deleted":false,"id":27,"name":"Железный правый наплечник","type":"pouldron-right","class":null,"kind":null,"strength_max":300,"coverage":10,"damage":null},{"_deleted":false,"id":9,"name":"Кожаные сапоги хуманов","type":"boots","class":null,"kind":null,"strength_max":100,"coverage":10,"damage":null},{"_deleted":false,"id":10,"name":"Кожаные сапоги урук-хаев","type":"boots","class":null,"kind":null,"strength_max":100,"coverage":10,"damage":null},{"_deleted":false,"id":11,"name":"Кожаные сапоги эльфов","type":"boots","class":null,"kind":null,"strength_max":100,"coverage":10,"damage":null},{"_deleted":false,"id":12,"name":"Укреплённый деревянный щит","type":"shield","class":null,"kind":null,"strength_max":440,"coverage":34,"damage":null},{"_deleted":false,"id":13,"name":"Короткий эльфийский меч","type":"weapon-one-handed","class":"normal","kind":"sword","strength_max":500,"coverage":null,"damage":70},{"_deleted":false,"id":14,"name":"Стандартный эльфийский меч","type":"weapon-one-handed","class":"normal","kind":"sword","strength_max":750,"coverage":null,"damage":105},{"_deleted":false,"id":15,"name":"Прямой стандартный эльфийский клинок","type":"weapon-one-handed","class":"normal","kind":"sword","strength_max":550,"coverage":null,"damage":90},{"_deleted":false,"id":16,"name":"Zweihander","type":"weapon-two-handed","class":"normal","kind":"sword","strength_max":1750,"coverage":null,"damage":190},{"_deleted":false,"id":17,"name":"Тяжелый тесак","type":"weapon-one-handed","class":"short","kind":"dagger","strength_max":450,"coverage":null,"damage":80},{"_deleted":false,"id":18,"name":"Шипованная дубина","type":"weapon-one-handed","class":"normal","kind":"mace","strength_max":350,"coverage":null,"damage":90},{"_deleted":false,"id":19,"name":"Посох шамана","type":"weapon-two-handed","class":"normal","kind":"staff","strength_max":350,"coverage":null,"damage":35},{"_deleted":false,"id":20,"name":"Деревянный посох","type":"weapon-two-handed","class":"normal","kind":"staff","strength_max":300,"coverage":null,"damage":25},{"_deleted":false,"id":21,"name":"Усиленный меч","type":"weapon-one-handed","class":"normal","kind":"sword","strength_max":475,"coverage":null,"damage":75},{"_deleted":false,"id":22,"name":"Стальной меч странника","type":"weapon-one-handed","class":"normal","kind":"sword","strength_max":505,"coverage":null,"damage":70},{"_deleted":false,"id":23,"name":"Деревянная дубина","type":"weapon-two-handed","class":"normal","kind":"mace","strength_max":200,"coverage":null,"damage":105},{"_deleted":false,"id":24,"name":"Простой железный меч","type":"weapon-one-handed","class":"normal","kind":"sword","strength_max":305,"coverage":null,"damage":65},{"_deleted":false,"id":25,"name":"Коготь смерти","type":"weapon-one-handed","class":"normal","kind":"sword","strength_max":705,"coverage":null,"damage":140},{"_deleted":false,"id":26,"name":"Тесак","type":"weapon-one-handed","class":"short","kind":"dagger","strength_max":205,"coverage":null,"damage":45}]
