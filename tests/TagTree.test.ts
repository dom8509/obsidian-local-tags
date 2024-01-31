import {
    addTagLeaf, createTagTree, getCollapsableTagList, getFullTagName, getFullTagNames, getTagList,
    getUserTagList, SortMethod, sortTagList, sortTagTree
} from '../src/TagTree';

test("createTagTree", () => {
	const tree = createTagTree();

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 0,
		childs: [],
	});
});

test("addTagLeaf.#tag1", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag1", "", 3);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 3,
		childs: [
			{ name: "tag1", path: "", userTag: true, count: 3, childs: [] },
		],
	});
});

test("addTagLeaf.replace_hash", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "#tag1", "", 3);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 3,
		childs: [
			{ name: "tag1", path: "", userTag: true, count: 3, childs: [] },
		],
	});
});

test("addTagLeaf.2x#tag1", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag1", "", 3);
	addTagLeaf(tree, "tag1", "", 6);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 9,
		childs: [
			{ name: "tag1", path: "", userTag: true, count: 9, childs: [] },
		],
	});
});

test("addTagLeaf.#path/tag2", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "path/tag2", "", 8);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 8,
		childs: [
			{
				name: "path",
				path: "",
				userTag: false,
				count: 8,
				childs: [
					{
						name: "tag2",
						path: "path",
						userTag: true,
						count: 8,
						childs: [],
					},
				],
			},
		],
	});
});

test("addTagLeaf.2x#path/tag2", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "path/tag2", "", 8);
	addTagLeaf(tree, "path/tag2", "", 4);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 12,
		childs: [
			{
				name: "path",
				path: "",
				userTag: false,
				count: 12,
				childs: [
					{
						name: "tag2",
						path: "path",
						userTag: true,
						count: 12,
						childs: [],
					},
				],
			},
		],
	});
});

test("addTagLeaf.#path/to/tag3", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "path/to/tag3", "", 5);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 5,
		childs: [
			{
				name: "path",
				path: "",
				userTag: false,
				count: 5,
				childs: [
					{
						name: "to",
						path: "path",
						userTag: false,
						count: 5,
						childs: [
							{
								name: "tag3",
								path: "path/to",
								userTag: true,
								count: 5,
								childs: [],
							},
						],
					},
				],
			},
		],
	});
});

test("addTagLeaf.#path/to/tag4&#path/to/tag5", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "path/to/tag4", "", 5);
	addTagLeaf(tree, "path/to/tag5", "", 4);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 9,
		childs: [
			{
				name: "path",
				path: "",
				userTag: false,
				count: 9,
				childs: [
					{
						name: "to",
						path: "path",
						userTag: false,
						count: 9,
						childs: [
							{
								name: "tag4",
								path: "path/to",
								userTag: true,
								count: 5,
								childs: [],
							},
							{
								name: "tag5",
								path: "path/to",
								userTag: true,
								count: 4,
								childs: [],
							},
						],
					},
				],
			},
		],
	});
});

test("addTagLeaf.#path/to/tag6&#path/tag7", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "path/to/tag6", "", 5);
	addTagLeaf(tree, "path/tag7", "", 4);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 9,
		childs: [
			{
				name: "path",
				path: "",
				userTag: false,
				count: 9,
				childs: [
					{
						name: "to",
						path: "path",
						userTag: false,
						count: 5,
						childs: [
							{
								name: "tag6",
								path: "path/to",
								userTag: true,
								count: 5,
								childs: [],
							},
						],
					},
					{
						name: "tag7",
						path: "path",
						userTag: true,
						count: 4,
						childs: [],
					},
				],
			},
		],
	});
});

test("sortTagTree.AtoZ.flat", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "tag1", "", 6);
	addTagLeaf(tree, "tag3", "", 2);
	addTagLeaf(tree, "tag2", "", 10);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 19,
		childs: [
			{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
			{ name: "tag1", path: "", userTag: true, count: 6, childs: [] },
			{ name: "tag3", path: "", userTag: true, count: 2, childs: [] },
			{ name: "tag2", path: "", userTag: true, count: 10, childs: [] },
		],
	});

	sortTagTree(tree, SortMethod.AtoZ);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 19,
		childs: [
			{ name: "tag1", path: "", userTag: true, count: 6, childs: [] },
			{ name: "tag2", path: "", userTag: true, count: 10, childs: [] },
			{ name: "tag3", path: "", userTag: true, count: 2, childs: [] },
			{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
		],
	});
});

test("sortTagTree.ZtoA.flat", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "tag1", "", 6);
	addTagLeaf(tree, "tag3", "", 2);
	addTagLeaf(tree, "tag2", "", 10);

	sortTagTree(tree, SortMethod.ZtoA);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 19,
		childs: [
			{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
			{ name: "tag3", path: "", userTag: true, count: 2, childs: [] },
			{ name: "tag2", path: "", userTag: true, count: 10, childs: [] },
			{ name: "tag1", path: "", userTag: true, count: 6, childs: [] },
		],
	});
});

test("sortTagTree.OccurrenceAscending.flat", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "tag1", "", 6);
	addTagLeaf(tree, "tag3", "", 2);
	addTagLeaf(tree, "tag2", "", 10);

	sortTagTree(tree, SortMethod.OccurrenceAscending);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 19,
		childs: [
			{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
			{ name: "tag3", path: "", userTag: true, count: 2, childs: [] },
			{ name: "tag1", path: "", userTag: true, count: 6, childs: [] },
			{ name: "tag2", path: "", userTag: true, count: 10, childs: [] },
		],
	});
});

test("sortTagTree.OccurrenceDescending.flat", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "tag1", "", 6);
	addTagLeaf(tree, "tag3", "", 2);
	addTagLeaf(tree, "tag2", "", 10);

	sortTagTree(tree, SortMethod.OccurrenceDescending);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 19,
		childs: [
			{ name: "tag2", path: "", userTag: true, count: 10, childs: [] },
			{ name: "tag1", path: "", userTag: true, count: 6, childs: [] },
			{ name: "tag3", path: "", userTag: true, count: 2, childs: [] },
			{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
		],
	});
});

test("sortTagTree.AtoZ.complex", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	sortTagTree(tree, SortMethod.AtoZ);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 28,
		childs: [
			{
				name: "a",
				path: "",
				userTag: false,
				count: 19,
				childs: [
					{
						name: "tag3",
						path: "a",
						userTag: true,
						count: 9,
						childs: [],
					},
					{
						name: "tag4",
						path: "a",
						userTag: true,
						count: 10,
						childs: [],
					},
				],
			},
			{
				name: "path",
				path: "",
				count: 8,
				userTag: false,
				childs: [
					{
						name: "to",
						path: "path",
						userTag: false,
						count: 8,
						childs: [
							{
								name: "tag3",
								path: "path/to",
								userTag: true,
								count: 2,
								childs: [],
							},
							{
								name: "tag6",
								path: "path/to",
								userTag: true,
								count: 6,
								childs: [],
							},
						],
					},
				],
			},
			{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
		],
	});
});

test("sortTagTree.ZtoA.complex", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	sortTagTree(tree, SortMethod.ZtoA);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 28,
		childs: [
			{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
			{
				name: "path",
				path: "",
				userTag: false,
				count: 8,
				childs: [
					{
						name: "to",
						path: "path",
						userTag: false,
						count: 8,
						childs: [
							{
								name: "tag6",
								path: "path/to",
								userTag: true,
								count: 6,
								childs: [],
							},
							{
								name: "tag3",
								path: "path/to",
								userTag: true,
								count: 2,
								childs: [],
							},
						],
					},
				],
			},
			{
				name: "a",
				path: "",
				userTag: false,
				count: 19,
				childs: [
					{
						name: "tag4",
						path: "a",
						userTag: true,
						count: 10,
						childs: [],
					},
					{
						name: "tag3",
						path: "a",
						userTag: true,
						count: 9,
						childs: [],
					},
				],
			},
		],
	});
});

test("sortTagTree.OccurrenceAscending.complex", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	sortTagTree(tree, SortMethod.OccurrenceAscending);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 28,
		childs: [
			{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
			{
				name: "path",
				path: "",
				userTag: false,
				count: 8,
				childs: [
					{
						name: "to",
						path: "path",
						userTag: false,
						count: 8,
						childs: [
							{
								name: "tag3",
								path: "path/to",
								userTag: true,
								count: 2,
								childs: [],
							},
							{
								name: "tag6",
								path: "path/to",
								userTag: true,
								count: 6,
								childs: [],
							},
						],
					},
				],
			},
			{
				name: "a",
				path: "",
				userTag: false,
				count: 19,
				childs: [
					{
						name: "tag3",
						path: "a",
						userTag: true,
						count: 9,
						childs: [],
					},
					{
						name: "tag4",
						path: "a",
						userTag: true,
						count: 10,
						childs: [],
					},
				],
			},
		],
	});
});

test("sortTagTree.OccurrenceDescending.complex", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	sortTagTree(tree, SortMethod.OccurrenceDescending);

	expect(tree).toStrictEqual({
		name: "root",
		path: "",
		userTag: false,
		count: 28,
		childs: [
			{
				name: "a",
				path: "",
				userTag: false,
				count: 19,
				childs: [
					{
						name: "tag4",
						path: "a",
						userTag: true,
						count: 10,
						childs: [],
					},
					{
						name: "tag3",
						path: "a",
						userTag: true,
						count: 9,
						childs: [],
					},
				],
			},
			{
				name: "path",
				path: "",
				userTag: false,
				count: 8,
				childs: [
					{
						name: "to",
						path: "path",
						userTag: false,
						count: 8,
						childs: [
							{
								name: "tag6",
								path: "path/to",
								userTag: true,
								count: 6,
								childs: [],
							},
							{
								name: "tag3",
								path: "path/to",
								userTag: true,
								count: 2,
								childs: [],
							},
						],
					},
				],
			},
			{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
		],
	});
});

test("getUserTagList", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	const list = getUserTagList(tree);

	expect(list).toStrictEqual([
		{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
		{
			name: "tag6",
			path: "path/to",
			userTag: true,
			count: 6,
			childs: [],
		},
		{
			name: "tag3",
			path: "path/to",
			userTag: true,
			count: 2,
			childs: [],
		},
		{ name: "tag4", path: "a", userTag: true, count: 10, childs: [] },
		{ name: "tag3", path: "a", userTag: true, count: 9, childs: [] },
	]);
});

test("getCollapsableTagList", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	const list = getCollapsableTagList(tree);

	expect(list).toStrictEqual([
		{
			name: "path",
			path: "",
			userTag: false,
			count: 8,
			childs: [],
		},
		{
			name: "a",
			path: "",
			userTag: false,
			count: 19,
			childs: [],
		},
		{
			name: "to",
			path: "path",
			userTag: false,
			count: 8,
			childs: [],
		},
	]);
});

test("getTagList", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	const list = getTagList(tree);

	expect(list).toStrictEqual([
		{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
		{
			name: "path",
			path: "",
			userTag: false,
			count: 8,
			childs: [],
		},
		{
			name: "a",
			path: "",
			userTag: false,
			count: 19,
			childs: [],
		},
		{
			name: "to",
			path: "path",
			userTag: false,
			count: 8,
			childs: [],
		},
		{
			name: "tag6",
			path: "path/to",
			userTag: true,
			count: 6,
			childs: [],
		},
		{
			name: "tag3",
			path: "path/to",
			userTag: true,
			count: 2,
			childs: [],
		},
		{ name: "tag4", path: "a", userTag: true, count: 10, childs: [] },
		{ name: "tag3", path: "a", userTag: true, count: 9, childs: [] },
	]);
});

test("getFullTagNames", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "path/to/tag6", "", 6);

	const fullPath = getFullTagName(tree.childs[0].childs[0].childs[0]);

	expect(fullPath).toStrictEqual("path/to/tag6");
});

test("getFullTagNames", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	const list = getTagList(tree);
	const fullPaths = getFullTagNames(list);

	expect(fullPaths).toStrictEqual([
		"tag5",
		"path",
		"a",
		"path/to",
		"path/to/tag6",
		"path/to/tag3",
		"a/tag4",
		"a/tag3",
	]);
});

test("sortTagList.AtoZ", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	const list = getUserTagList(tree);
	sortTagList(list, SortMethod.AtoZ);

	expect(list).toStrictEqual([
		{ name: "tag3", path: "a", userTag: true, count: 9, childs: [] },
		{ name: "tag4", path: "a", userTag: true, count: 10, childs: [] },
		{
			name: "tag3",
			path: "path/to",
			userTag: true,
			count: 2,
			childs: [],
		},
		{
			name: "tag6",
			path: "path/to",
			userTag: true,
			count: 6,
			childs: [],
		},
		{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
	]);
});

test("sortTagList.ZtoA", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	const list = getUserTagList(tree);
	sortTagList(list, SortMethod.ZtoA);

	expect(list).toStrictEqual([
		{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
		{
			name: "tag6",
			path: "path/to",
			userTag: true,
			count: 6,
			childs: [],
		},
		{
			name: "tag3",
			path: "path/to",
			userTag: true,
			count: 2,
			childs: [],
		},
		{ name: "tag4", path: "a", userTag: true, count: 10, childs: [] },
		{ name: "tag3", path: "a", userTag: true, count: 9, childs: [] },
	]);
});

test("sortTagList.OccurrenceAscending", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	const list = getUserTagList(tree);
	sortTagList(list, SortMethod.OccurrenceAscending);

	expect(list).toStrictEqual([
		{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
		{
			name: "tag3",
			path: "path/to",
			userTag: true,
			count: 2,
			childs: [],
		},
		{
			name: "tag6",
			path: "path/to",
			userTag: true,
			count: 6,
			childs: [],
		},
		{ name: "tag3", path: "a", userTag: true, count: 9, childs: [] },
		{ name: "tag4", path: "a", userTag: true, count: 10, childs: [] },
	]);
});

test("sortTagList.OccurrenceDescending", () => {
	const tree = createTagTree();
	addTagLeaf(tree, "tag5", "", 1);
	addTagLeaf(tree, "path/to/tag6", "", 6);
	addTagLeaf(tree, "path/to/tag3", "", 2);
	addTagLeaf(tree, "a/tag4", "", 10);
	addTagLeaf(tree, "a/tag3", "", 9);

	const list = getUserTagList(tree);
	sortTagList(list, SortMethod.OccurrenceDescending);

	expect(list).toStrictEqual([
		{ name: "tag4", path: "a", userTag: true, count: 10, childs: [] },
		{ name: "tag3", path: "a", userTag: true, count: 9, childs: [] },
		{
			name: "tag6",
			path: "path/to",
			userTag: true,
			count: 6,
			childs: [],
		},
		{
			name: "tag3",
			path: "path/to",
			userTag: true,
			count: 2,
			childs: [],
		},
		{ name: "tag5", path: "", userTag: true, count: 1, childs: [] },
	]);
});
