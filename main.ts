import {
    ItemView, Menu, Notice, Plugin, Pos, setIcon, TAbstractFile, TagCache, TFile, WorkspaceLeaf
} from 'obsidian';

const LOCAL_TAGS_VIEW: string = "local-tags-view";
const ALL_VIEW: string = "all-view";

enum SortMethods {
	AtoZ,
	ZtoA,
	OccurrenceDescending,
	OccurrenceAscending,
}

type TagGroup = {
	name: string;
	value: Pos[];
};

type TagLeaf = {
	value: TagGroup;
	childs: TagGroup[];
}

type TagTree = TagLeaf[];

type CallbackFcn = () => void;
type CallbackEventFcn = (event: MouseEvent) => void;

export default class LocalTagsPlugin extends Plugin {
	onload(): void {
		// console.log('load plugin') // enable plugin

		this.registerView(LOCAL_TAGS_VIEW, (leaf) => new LocalTagsView(leaf));
		// this.registerView(CANVAS_VIEW, (leaf) => new CanvasView(leaf));

		this.addCommand({
			id: ALL_VIEW,
			name: "Enable plugin",
			callback: () => {
				this.onloadLocalTagsView();
				// this.onloadCanvasView();
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
}

class LocalTagsView extends ItemView {
	m_sortMethod = 2;
	m_grouped = false;
	m_collapsed = false;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

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
				.setChecked(this.m_sortMethod == 0)
				.onClick(() => {
					this.m_sortMethod = 0;

					renderView(
						sortLocalTags(this.getLocalTags(), this.m_sortMethod),
						this.containerEl,
						this.m_grouped,
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
				.setChecked(this.m_sortMethod == 1)
				.onClick(() => {
					this.m_sortMethod = 1;

					renderView(
						sortLocalTags(this.getLocalTags(), this.m_sortMethod),
						this.containerEl,
						this.m_grouped,
						this.onSortTagsClicked,
						this.onGroupTagsClicked,
						this.onCollapseTagsClicked
					);
				})
		);

		menu.addSeparator();

		menu.addItem((item) =>
			item
				.setTitle("Häufigkeit (hoch - niedrig)")
				.setIcon("documents")
				.setChecked(this.m_sortMethod == 2)
				.onClick(() => {
					this.m_sortMethod = 2;

					renderView(
						sortLocalTags(this.getLocalTags(), this.m_sortMethod),
						this.containerEl,
						this.m_grouped,
						this.onSortTagsClicked,
						this.onGroupTagsClicked,
						this.onCollapseTagsClicked
					);
				})
		);

		menu.addItem((item) =>
			item
				.setTitle("Häufigkeit (niedrig - hoch)")
				.setIcon("documents")
				.setChecked(this.m_sortMethod == 3)
				.onClick(() => {
					this.m_sortMethod = 3;

					renderView(
						sortLocalTags(this.getLocalTags(), this.m_sortMethod),
						this.containerEl,
						this.m_grouped,
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

		this.m_grouped = !this.m_grouped;

		renderView(
			sortLocalTags(this.getLocalTags(), this.m_sortMethod),
			this.containerEl,
			this.m_grouped,
			this.onSortTagsClicked,
			this.onGroupTagsClicked,
			this.onCollapseTagsClicked
		);
	}

	onCollapseTagsClicked() {
		console.log("onCollapseTagsClicked");
	}

	async onOpen(): Promise<void> {
		this.icon = "stamp";

		renderView(
			sortLocalTags(this.getLocalTags(), this.m_sortMethod),
			this.containerEl,
			this.m_grouped,
			this.onSortTagsClicked,
			this.onGroupTagsClicked,
			this.onCollapseTagsClicked
		);

		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				renderView(
					sortLocalTags(this.getLocalTags(), this.m_sortMethod),
					this.containerEl,
					this.m_grouped,
					this.onSortTagsClicked,
					this.onGroupTagsClicked,
					this.onCollapseTagsClicked
				);
			})
		);
	}

	getLocalTags(): TagGroup[] {
		const activeFile: TFile | null = this.app.workspace.getActiveFile();

		if (activeFile == null) {
			return [];
		}

		const fileCache = this.app.metadataCache.getFileCache(activeFile);

		if (fileCache == null) {
			return [];
		}

		const tagCache = fileCache.tags;

		if (tagCache == undefined) {
			return [];
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

		const tagGroups: TagGroup[] = Object.entries(groupedTags).map(
			([name, value]) => ({
				name,
				value,
			})
		);

		return tagGroups;
	}

	async onClose(): Promise<void> {
		// console.log('close local-tag view');
	}
}

function sortLocalTags(tags: TagGroup[], sortMethod: SortMethods): TagGroup[] {
	switch (sortMethod) {
		case SortMethods.AtoZ:
			tags.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case SortMethods.ZtoA:
			tags.sort((a, b) => b.name.localeCompare(a.name));
			break;
		case SortMethods.OccurrenceDescending:
			tags.sort((a, b) => b.value.length - a.value.length);
			break;
		case SortMethods.OccurrenceAscending:
			tags.sort((a, b) => a.value.length - b.value.length);
			break;
	}

	return tags;
}

// function groupLocalTags(tags: TagGroup[]): TagTree {}

function isTagGroup(tagName: string) {
	return tagName.includes("/");
}

function createTagList(el: HTMLDivElement, tag: TagGroup) {
	const contentTreeItem: HTMLDivElement = el.createDiv({
		cls: "tree-item",
	});

	contentTreeItem.createDiv(
		{
			cls: "tree-item-self is-clickable outgoing-link-item",
			attr: { draggable: true },
		},
		(el) => {
			el.createDiv({
				cls: "tree-item-inner",
				text: tag.name.replace("#", ""),
			}).addEventListener("click", () => {
				const query = `tag:${tag.name} file:"${
					this.app.workspace.getActiveFile().name
				}"`;
				this.app.internalPlugins.plugins[
					"global-search"
				].instance.openGlobalSearch(query);
			});
			el.createDiv({ cls: "tree-item-flair-outer" }, (el) => {
				el.createSpan({
					cls: "tag-pane-tag-count tree-item-flair",
					text: tag.value.length.toString(),
				});
			});
		}
	);
}

function createTreeEl(el: HTMLDivElement, tag: string) {
	const contentTreeItem: HTMLDivElement = el.createDiv({
		cls: "tree-item",
	});

	const tagTokens: string[] = tag.split("/");

	for (let i = 0; i < tagTokens.length; ++i) {
		console.log(tagTokens[i]);
	}
}

function createTagTree(el: HTMLDivElement, tag: TagGroup, tagPath: string) {
	const contentTreeItem: HTMLDivElement = el.createDiv({
		cls: "tree-item",
	});

	const tagTokens: string[] = tag.name
		.replace("#", "")
		.replace(tagPath, "")
		.split("/");

	const currentFullTag = `tag:${tagPath}/${tagTokens[0]}`.replace(
		/tag:\//,
		""
	);
	console.log("currentFullTag");
	console.log(currentFullTag);

	console.log(tagTokens);

	console.log(tagTokens[0]);
	contentTreeItem.createDiv(
		{
			cls: "tree-item-self is-clickable mod-collapsible",
			attr: {
				style: "margin-left: 0px !important; padding-left: 24px !important;",
			},
		},
		(el) => {
			console.log(`tag:${tagPath}/${tagTokens[0]}`.replace(/^\//, ""));
			if (tagTokens.length > 1) {
				el.createDiv(
					{
						cls: "tree-item-icon collapse-icon",
					},
					(el) => {
						setIcon(el, "right-triangle");
					}
				);
			}
			el.createSpan(
				{
					cls: "tree-item-inner",
					text: tagTokens[0],
				},
				(el) => {
					el.createDiv;
				}
			).addEventListener("click", () => {
				const query =
					`tag:${tagPath}/${tagTokens[0]}`.replace(/tag:\//, "tag:") +
					" " +
					`file:"${this.app.workspace.getActiveFile().name}"`;
				this.app.internalPlugins.plugins[
					"global-search"
				].instance.openGlobalSearch(query);
			});
			el.createDiv({ cls: "tree-item-flair-outer" }, (el) => {
				el.createSpan({
					cls: "tag-pane-tag-count tree-item-flair",
					text: tag.value.length.toString(),
				});
			});
		}
	);

	if (tagTokens.length > 0) {
		el.createDiv(
			{
				cls: "tree-item-children",
			},
			(child) => {
				child.createDiv({
					attr: {
						style: "width: 1px; height: 0.1px; margin-bottom: 0px;",
					},
				});

				const subTag = tagTokens
					.slice(1)
					.reduce((acc, current) => {
						const previous =
							acc.length > 0 ? acc[acc.length - 1] : "";
						const combined = previous
							? `${previous}/${current}`.replace(/^\//, "")
							: current;
						return [...acc, combined];
					}, [])
					.pop();

				console.log(subTag);
				if (subTag) {
					createTagTree(
						child,
						{ name: subTag, value: tag.value },
						`${tagPath}/${tagTokens[0]}`.replace(/^\//, "")
					);
				}
			}
		);
	}
}

function renderView(
	tags: TagGroup[],
	container: Element,
	groupBtnActive: boolean,
	onSortTagsClicked: CallbackEventFcn,
	onGroupTagsClicked: CallbackFcn,
	onCollapseTagsClicked: CallbackFcn
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
			onCollapseTagsClicked();
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

	for (const tag of tags) {
		if (groupBtnActive) {
			createTagTree(content, tag, "");
		} else {
			createTagList(content, tag);
		}
	}
}
