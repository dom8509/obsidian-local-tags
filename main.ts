import {
    App, ItemView, Menu, Notice, Plugin, PluginManifest, Pos, setIcon, TAbstractFile, TagCache,
    TFile, WorkspaceLeaf
} from 'obsidian';
import {
    addTagLeaf, createTagTree, getCollapsableTagList, getFullTagName, getFullTagNames,
    getUserTagList, SortMethod, sortTagList, sortTagTree, TagLeaf, TagList, TagTree
} from 'src/TagTree';

const LOCAL_TAGS_VIEW: string = "local-tags-view";
const ALL_VIEW: string = "all-view";

type TagGroup = {
	name: string;
	value: Pos[];
};

export default class LocalTagsPlugin extends Plugin {
	m_sortMethod = 2;
	m_grouped = false;
	m_collapsedTags: { [key: string]: boolean } = {};

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		this.onSortTags = this.onSortTags.bind(this);
		this.onGroupTags = this.onGroupTags.bind(this);
	}

	onload(): void {
		// console.log('load plugin') // enable plugin

		this.registerView(
			LOCAL_TAGS_VIEW,
			(leaf) => new LocalTagsView(leaf, this)
		);

		this.addCommand({
			id: ALL_VIEW,
			name: "Enable plugin",
			callback: () => {
				this.onloadLocalTagsView();
			},
		});
	}

	async onloadLocalTagsView(): Promise<void> {
		if (this.app.workspace.getLeavesOfType(LOCAL_TAGS_VIEW).length == 0) {
			await this.app.workspace.getRightLeaf(false).setViewState({
				type: LOCAL_TAGS_VIEW,
				active: true,
			}); // view#onOpen()
		}
	}

	onunload(): void {
		// console.log('unload local-tag plugin'); // disable plugin
	}

	getSortMethod() {
		return this.m_sortMethod;
	}

	isGrouped() {
		return this.m_grouped;
	}

	onSortTags(value: SortMethod) {
		this.m_sortMethod = value;
	}

	onGroupTags() {
		this.m_grouped = !this.m_grouped;
	}
}

type GroupTagsClickedCallbackFcn = () => void;
type SortTagsClickedCallbackFcn = (event: MouseEvent) => void;
type CollapseTagsClickedCallbackFcn = (
	tag: TagLeaf[],
	collapseAll: boolean
) => void;

class LocalTagsView extends ItemView {
	m_plugin: LocalTagsPlugin;
	m_collapsed_tags: string[];
	m_all_tags_collapsed: boolean;

	constructor(leaf: WorkspaceLeaf, plugin: LocalTagsPlugin) {
		super(leaf);

		console.log("Creating LocalTagsView");

		this.m_plugin = plugin;
		this.m_collapsed_tags = [];
		this.m_all_tags_collapsed = false;

		this.onSortTagsClicked = this.onSortTagsClicked.bind(this);
		this.onGroupTagsClicked = this.onGroupTagsClicked.bind(this);
		this.onCollapseTagsClicked = this.onCollapseTagsClicked.bind(this);
	}

	getViewType(): string {
		return LOCAL_TAGS_VIEW;
	}

	getDisplayText(): string {
		return "Local Tags";
	}

	onSortTagsClicked(event: MouseEvent) {
		console.log("onSortTagsClicked");

		const menu = new Menu();

		menu.addItem((item) =>
			item
				.setTitle("Tag (A - Z)")
				.setIcon("documents")
				.setChecked(this.m_plugin.getSortMethod() == SortMethod.AtoZ)
				.onClick(() => {
					this.m_plugin.onSortTags(SortMethod.AtoZ);

					renderView(
						this.getLocalTags(),
						this.containerEl,
						this.m_collapsed_tags,
						this.m_plugin.isGrouped(),
						this.m_plugin.getSortMethod(),
						this.onSortTagsClicked,
						this.onGroupTagsClicked,
						this.onCollapseTagsClicked
					);
				})
		);

		menu.addItem((item) =>
			item
				.setTitle("Tag (Z - A)")
				.setIcon("documents")
				.setChecked(this.m_plugin.getSortMethod() == SortMethod.ZtoA)
				.onClick(() => {
					this.m_plugin.onSortTags(SortMethod.ZtoA);

					renderView(
						this.getLocalTags(),
						this.containerEl,
						this.m_collapsed_tags,
						this.m_plugin.isGrouped(),
						this.m_plugin.getSortMethod(),
						this.onSortTagsClicked,
						this.onGroupTagsClicked,
						this.onCollapseTagsClicked
					);
				})
		);

		menu.addSeparator();

		menu.addItem((item) =>
			item
				.setTitle("Occurance (high - low)")
				.setIcon("documents")
				.setChecked(
					this.m_plugin.getSortMethod() ==
						SortMethod.OccurrenceDescending
				)
				.onClick(() => {
					this.m_plugin.onSortTags(SortMethod.OccurrenceDescending);

					renderView(
						this.getLocalTags(),
						this.containerEl,
						this.m_collapsed_tags,
						this.m_plugin.isGrouped(),
						this.m_plugin.getSortMethod(),
						this.onSortTagsClicked,
						this.onGroupTagsClicked,
						this.onCollapseTagsClicked
					);
				})
		);

		menu.addItem((item) =>
			item
				.setTitle("Occurance (low - high)")
				.setIcon("documents")
				.setChecked(
					this.m_plugin.getSortMethod() ==
						SortMethod.OccurrenceAscending
				)
				.onClick(() => {
					this.m_plugin.onSortTags(SortMethod.OccurrenceAscending);

					renderView(
						this.getLocalTags(),
						this.containerEl,
						this.m_collapsed_tags,
						this.m_plugin.isGrouped(),
						this.m_plugin.getSortMethod(),
						this.onSortTagsClicked,
						this.onGroupTagsClicked,
						this.onCollapseTagsClicked
					);
				})
		);

		menu.showAtMouseEvent(event);
	}

	onGroupTagsClicked() {
		console.log("onGroupTagsClicked");

		this.m_plugin.onGroupTags();

		renderView(
			this.getLocalTags(),
			this.containerEl,
			this.m_collapsed_tags,
			this.m_plugin.isGrouped(),
			this.m_plugin.getSortMethod(),
			this.onSortTagsClicked,
			this.onGroupTagsClicked,
			this.onCollapseTagsClicked
		);
	}

	onCollapseTagsClicked(tags: TagLeaf[], collapseAll: boolean) {
		console.log("onCollapseTagsClicked");

		if (collapseAll) {
			this.m_collapsed_tags = [];
			if (this.m_all_tags_collapsed) {
				// expand all if all tags are collapsed and btn is pressed again
				this.m_all_tags_collapsed = false;
			} else {
				// add all collapsable tags to the list
				this.m_collapsed_tags = getFullTagNames(tags);
				this.m_all_tags_collapsed = true;
			}
		} else {
			// Reset collapse all if one single tag is collapsed
			if (this.m_all_tags_collapsed) {
				this.m_all_tags_collapsed = false;
			}

			for (const tag of tags) {
				const fullTagName = getFullTagName(tag);
				if (this.m_collapsed_tags.contains(fullTagName)) {
					this.m_collapsed_tags.remove(fullTagName);
				} else {
					this.m_collapsed_tags.push(fullTagName);
				}
			}
		}

		console.log(this.m_all_tags_collapsed);
		console.log(this.m_collapsed_tags);

		renderView(
			this.getLocalTags(),
			this.containerEl,
			this.m_collapsed_tags,
			this.m_plugin.isGrouped(),
			this.m_plugin.getSortMethod(),
			this.onSortTagsClicked,
			this.onGroupTagsClicked,
			this.onCollapseTagsClicked
		);
	}

	async onOpen(): Promise<void> {
		console.log("Opening Local Tags View");

		this.icon = "stamp";

		renderView(
			this.getLocalTags(),
			this.containerEl,
			this.m_collapsed_tags,
			this.m_plugin.isGrouped(),
			this.m_plugin.getSortMethod(),
			this.onSortTagsClicked,
			this.onGroupTagsClicked,
			this.onCollapseTagsClicked
		);

		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				renderView(
					this.getLocalTags(),
					this.containerEl,
					this.m_collapsed_tags,
					this.m_plugin.isGrouped(),
					this.m_plugin.getSortMethod(),
					this.onSortTagsClicked,
					this.onGroupTagsClicked,
					this.onCollapseTagsClicked
				);
			})
		);
	}

	getLocalTags(): TagTree {
		const tagTree = createTagTree();
		const activeFile: TFile | null = this.app.workspace.getActiveFile();

		if (activeFile == null) {
			return tagTree;
		}

		const fileCache = this.app.metadataCache.getFileCache(activeFile);

		if (fileCache == null) {
			return tagTree;
		}

		const tagCache = fileCache.tags;

		if (tagCache == undefined) {
			return tagTree;
		}

		type GroupedTags = { [tag: string]: Pos[] };
		const groupedTags = tagCache.reduce(
			(groups: GroupedTags, tagElement) => {
				const { tag, position } = tagElement;

				if (!groups[tag]) {
					groups[tag] = [];
				}
				groups[tag].push(position);
				return groups;
			},
			{}
		);

		for (const [name, value] of Object.entries(groupedTags)) {
			addTagLeaf(tagTree, name, "", value.length);
		}

		return tagTree;
	}

	async onClose(): Promise<void> {
		// console.log('close local-tag view');
	}
}

function createTagTreeView(
	el: HTMLDivElement,
	tagTree: TagTree,
	collapsedTags: string[],
	onCollapseTagsClicked: CollapseTagsClickedCallbackFcn
) {
	for (let tag of tagTree.childs) {
		const currentFullTag = getFullTagName(tag);
		console.log(collapsedTags)
		const isCollapsedClassString = collapsedTags.contains(currentFullTag) ? "is-collapsed" : ""

		const contentTreeItem: HTMLDivElement = el.createDiv({
			cls: `tree-item ${isCollapsedClassString}`,
		});

		contentTreeItem
			.createDiv(
				{
					cls: "tree-item-self is-clickable mod-collapsible",
					attr: {
						style: "margin-left: 0px !important; padding-left: 24px !important;",
					},
				},
				(el) => {
					// If the tag has also child items create foldable list icon
					if (tag.childs.length > 0) {
						el.createDiv(
							{
								cls: `tree-item-icon collapse-icon ${isCollapsedClassString}`,
							},
							(foldBtnEl) => {
								setIcon(foldBtnEl, "right-triangle");
							}
						).addEventListener("click", (event) => {
							onCollapseTagsClicked([tag], false);
							event.stopPropagation();
						});
					}

					el.createSpan(
						{
							cls: "tree-item-inner",
							text: tag.name,
						},
						(el) => {
							el.createDiv;
						}
					);

					el.createDiv(
						{ cls: "tree-item-flair-outer" },
						(countEl) => {
							countEl.createSpan({
								cls: "tag-pane-tag-count tree-item-flair",
								text: tag.count.toString(),
							});
						}
					);
				}
			)
			.addEventListener("click", () => {
				const query =
					`tag:${currentFullTag}`.replace(/tag:\//, "tag:") +
					" " +
					`file:"${this.app.workspace.getActiveFile().name}"`;
				this.app.internalPlugins.plugins[
					"global-search"
				].instance.openGlobalSearch(query);
			});

		if (tag.childs.length > 0 && !collapsedTags.contains(currentFullTag)) {
			contentTreeItem.createDiv(
				{
					cls: "tree-item-children",
				},
				(childEl) => {
					childEl.createDiv({
						attr: {
							style: "width: 1px; height: 0.1px; margin-bottom: 0px;",
						},
					});

					createTagTreeView(childEl, tag, collapsedTags, onCollapseTagsClicked);
				}
			);
		}
	}
}

function createTagListView(el: HTMLDivElement, tagList: TagList) {
	for (let tag of tagList) {
		const currentTag = (tag.path + "/" + tag.name).replace(/^\//, "");

		const contentTreeItem: HTMLDivElement = el.createDiv({
			cls: "tree-item",
		});

		contentTreeItem
			.createDiv(
				{
					cls: "tree-item-self is-clickable outgoing-link-item",
					attr: { draggable: true },
				},
				(el) => {
					el.createDiv({
						cls: "tree-item-inner",
						text: currentTag,
					});
					el.createDiv({ cls: "tree-item-flair-outer" }, (el) => {
						el.createSpan({
							cls: "tag-pane-tag-count tree-item-flair",
							text: tag.count.toString(),
						});
					});
				}
			)
			.addEventListener("click", () => {
				const query = `tag:#${currentTag} file:"${
					this.app.workspace.getActiveFile().name
				}"`;
				this.app.internalPlugins.plugins[
					"global-search"
				].instance.openGlobalSearch(query);
			});
	}
}

function renderView(
	tagTree: TagTree,
	container: Element,
	collapsedTags: string[],
	groupBtnActive: boolean,
	sortMethod: SortMethod,
	onSortTagsClicked: SortTagsClickedCallbackFcn,
	onGroupTagsClicked: GroupTagsClickedCallbackFcn,
	onCollapseTagsClicked: CollapseTagsClickedCallbackFcn
): void {
	container.empty();

	const navHeader: HTMLDivElement = container.createDiv({
		cls: "nav-header",
	});

	const navHeaderBtns = navHeader.createDiv({
		cls: "nav-buttons-container",
	});

	const sortBtn = navHeaderBtns.createDiv({
		cls: "clickable-icon nav-action-button",
		attr: {
			"aira-label": "Sortierreihenfolge ändern",
		},
	});
	sortBtn.addEventListener("click", (event) => {
		onSortTagsClicked(event);
	});
	setIcon(sortBtn, "arrow-up-narrow-wide");

	const groupBtn = navHeaderBtns.createDiv({
		cls: "clickable-icon nav-action-button",
		attr: {
			"aira-label": "Zeige verschachtelte Tags",
		},
	});
	if (groupBtnActive) {
		groupBtn.addClass("is-active");
	}
	groupBtn.addEventListener("click", () => {
		onGroupTagsClicked();
	});
	setIcon(groupBtn, "folder-tree");

	const collapseBtn = navHeaderBtns.createDiv({
		cls: "clickable-icon nav-action-button",
		attr: {
			"aira-label": "Alles einklappen",
			"aria-disabled": !groupBtnActive,
		},
	});
	if (groupBtnActive) {
		collapseBtn.addEventListener("click", () => {
			onCollapseTagsClicked(getCollapsableTagList(tagTree), true);
		});
	}
	setIcon(collapseBtn, "chevrons-down-up");

	const pane: HTMLDivElement = container.createDiv({
		cls: "local-tags-pane node-insert-event",
		attr: { style: "position: relative;" },
	});

	const header: HTMLDivElement = pane.createDiv({
		cls: "tree-item-self is-clickable",
		attr: {
			"aria-label": "Click to collapse",
			"aria-label-position": "right",
		},
	});
	header.createSpan({ cls: "tree-item-icon collapse-icon" });
	header.createDiv({
		cls: "tree-item-inner",
		text: "Local Tags",
	});
	header.createDiv({ cls: "tree-item-flair-outer" }, (el) => {
		el.createSpan({
			cls: "tree-item-flair",
		});
	});

	const content: HTMLDivElement = pane.createDiv({
		cls: "search-result-container",
	});
	content.createDiv({
		attr: {
			style: "width: 1px; height: 0.1px; margin-bottom: 0px;",
		},
	});

	if (groupBtnActive) {
		createTagTreeView(
			content,
			sortTagTree(tagTree, sortMethod),
			collapsedTags,
			onCollapseTagsClicked
		);
	} else {
		createTagListView(
			content,
			sortTagList(getUserTagList(tagTree), sortMethod)
		);
	}
}
