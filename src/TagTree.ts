export enum SortMethod {
	AtoZ,
	ZtoA,
	OccurrenceDescending,
	OccurrenceAscending,
}

export type TagLeaf = {
	name: string;
	path: string;
	userTag: boolean;
	count: number;
	childs: TagLeaf[];
};

export type TagTree = TagLeaf;
export type TagList = TagLeaf[];

export function createTagTree(): TagTree {
	return {
		name: "root",
		path: "",
		userTag: false,
		count: 0,
		childs: [],
	};
}

export function addTagLeaf(
	leaf: TagLeaf,
	tag: string,
	path: string,
	count: number
) {
	if (leaf.name === "root") {
		leaf.count += count;
	}
	if (tag.startsWith("#")) {
		tag = tag.replace(/^#/, "");
	}
	const tagTokens = tag.split("/");

	let found = false;
	for (let child of leaf.childs) {
		if (child.name === tagTokens[0]) {
			// at count to current tag
			child.count += count;

			// is there more to process?
			if (tagTokens.length > 1) {
				const nextPath = `${child.path}/${tagTokens[0]}`.replace(
					/^\//,
					""
				);
				const nextTag = tagTokens.slice(1).join("/").replace(/^\//, "");

				addTagLeaf(child, nextTag, nextPath, count);
			} else {
				child.userTag = true;
			}

			found = true;
		}
	}

	if (!found) {
		const newLeaf = {
			name: tagTokens[0],
			path: path,
			userTag: false,
			count: count,
			childs: [],
		};

		if (tagTokens.length > 1) {
			const nextPath = `${path}/${tagTokens[0]}`.replace(/^\//, "");
			const nextTag = tagTokens.slice(1).join("/").replace(/^\//, "");

			addTagLeaf(newLeaf, nextTag, nextPath, count);
		} else {
			newLeaf.userTag = true;
		}

		leaf.childs.push(newLeaf);
	}
}

function sortTagLeafs(
	a: TagLeaf,
	b: TagLeaf,
	method: SortMethod,
	useFullName: boolean
) {
	let tagNameA = a.name;
	let tagNameB = b.name;

	if (useFullName) {
		tagNameA = `${a.path}/${tagNameA}`.replace(/^\//, "");
		tagNameB = `${b.path}/${tagNameB}`.replace(/^\//, "");
	}

	switch (method) {
		case SortMethod.AtoZ:
			return tagNameA.localeCompare(tagNameB);
		case SortMethod.ZtoA:
			return tagNameB.localeCompare(tagNameA);
		case SortMethod.OccurrenceDescending:
			return b.count - a.count;
		case SortMethod.OccurrenceAscending:
			return a.count - b.count;
	}
}

export function sortTagTree(tree: TagLeaf, method: SortMethod) {
	tree.childs.sort((a, b) => sortTagLeafs(a, b, method, false));

	for (let child of tree.childs) {
		sortTagTree(child, method);
	}

	return tree;
}

/**
 * Get all the tag that are explicitly set by the user in the document.
 * This does not include the paths if nested tags are used.
 *
 * @param tree 	A tree of tags
 * @returns 	A list of all the explicitly used tags
 */
export function getUserTagList(tree: TagTree): TagList {
	let tagList: TagList = tree.childs.filter((e) => e.userTag);

	for (let child of tree.childs) {
		tagList = [...tagList, ...getUserTagList(child)];
	}

	return tagList.map((tag) => ({
		...tag,
		childs: []
	}));
}

/**
 * Get all the tags in the document that are part of a tag path.
 * This is used to find out which tags could be collapsed in a tree list.
 *
 * @param tree 	A tree of tags
 * @returns 	A list of all tags in the TagTree with child items
 */
export function getCollapsableTagList(tree: TagTree): TagList {
	let tagList: TagList = tree.childs.filter((e) => e.childs.length > 0);

	for (let child of tree.childs) {
		tagList = [...tagList, ...getCollapsableTagList(child)];
	}

	return tagList.map((tag) => ({
		...tag,
		childs: []
	}));
}

/**
 * Get all the tags in the document.
 * This function will also return the path of nested tags as separate tags.
 *
 * @param tree 	A tree of tags
 * @returns 	A list of all tags in the TagTree
 */
export function getTagList(tree: TagTree): TagList {
	let tagList: TagList = tree.childs;

	for (let child of tree.childs) {
		tagList = [...tagList, ...getTagList(child)];
	}

	return tagList.map((tag) => ({
		...tag,
		childs: []
	}));
}

export function getFullTagName(tag: TagLeaf) {
	return `${tag.path}/${tag.name}`.replace(/^\//, "");
}

export function getFullTagNames(list: TagList): string[] {
	return list.map((e) => getFullTagName(e));
}

export function sortTagList(list: TagList, method: SortMethod) {
	list.sort((a, b) => sortTagLeafs(a, b, method, true));

	return list;
}
