/**
 * Team Org Chart
 * @package Team
 */

var sp_team_chart_content_loaded = false;
var params_for_chart = {}
var postId = jQuery('.sp-team-org-chart-container').data('id');
var sp_team_chart = {
	ids: {
		'tree': 'sp-team-member-tree' + postId,
	},
	initial_tree_string: "{}",
	default_info: {
		"image_url": '',
		"node_title": "Title",
		"node_description": "Description",
	},

	start: function () {
		this.tree_node_element();
		this.delegateEvents();
		this.enableSorting();
	},

	delegateEvents: function () {
		// Use event delegation to handle dynamically added nodes
		const treeContainer = document.getElementById(this.ids.tree);

		if (!treeContainer) {
			return;
		}

		treeContainer.addEventListener('click', (e) => {
			if (e.target && e.target.classList.contains('add_child_button')) {
				this.handleAddChild(e.target);
			} else if (e.target && e.target.classList.contains('add_bro_right')) {
				this.handleAddSibling(e.target, false);
			} else if (e.target && e.target.classList.contains('add_bro_left')) {
				this.handleAddSibling(e.target, true);
			} else if (e.target && e.target.closest('.remove_tree_node')) {
				this.handleRemoveNode(e.target.closest('.remove_tree_node'));
			}
		});
	},

	handleAddChild: function (addButtonNode) {
		const parentNode = addButtonNode.closest('li');
		let appendedNode = parentNode.querySelector('ul');

		if (appendedNode) {
			appendedNode.appendChild(this.tree_node_element(false));
		} else {
			appendedNode = document.createElement('ul');
			appendedNode.appendChild(this.tree_node_element(false));
			parentNode.appendChild(appendedNode);
		}
		this.enableSorting();
		updateTreeButtons(parentNode);
		syncTreeData();
	},

	handleAddSibling: function (addButtonNode, left = true) {
		const targetElement = addButtonNode.closest('li');
		const newNode = this.tree_node_element(false);

		if (left) {
			targetElement.parentNode.insertBefore(newNode, targetElement);
		} else {
			targetElement.parentNode.insertBefore(newNode, targetElement.nextSibling);
		}
		this.enableSorting();
		updateTreeButtons(targetElement);
		syncTreeData();
	},

	handleRemoveNode: function (removeButtonNode) {
		const nodeElement = removeButtonNode.closest('li');
		const parentUl = nodeElement.parentNode;

		if (nodeElement.querySelector('ul')) {
			const confirmDelete = confirm("This node has child elements. Do you want to delete it?");
			if (!confirmDelete) return;
		}

		if (parentUl.children.length === 1) {
			parentUl.remove();
		} else {
			nodeElement.remove();
		}

		updateTreeButtons(parentUl);
		syncTreeData();
	},

	// Create new tree node
	tree_node_element: function (with_ul = true, info = null) {
		info = info || this.default_info;

		const ul = this.createHtmlElement('ul');
		const li = this.createHtmlElement('li');
		const div = this.createHtmlElement('div', { 'class': 'sp-team-member-tree-node' });

		// Create select container (dropdown)
		const selectContainer = this.createGroupSelectField();

		// Create buttons
		const addChildButton = this.createHtmlElement('button', { 'class': 'add_child_button', 'type': 'button', 'aria-label': 'Add Child' });
		const addBroRightButton = this.createHtmlElement('button', { 'class': 'add_bro_right', 'type': 'button', 'aria-label': 'Add Sibling (Right)' });
		const addBroLeftButton = this.createHtmlElement('button', { 'class': 'add_bro_left', 'type': 'button', 'aria-label': 'Add Sibling (Left)' });
		const removeNodeButton = this.createHtmlElement('span', { 'class': 'dashicons dashicons-trash remove_tree_node', 'type': 'button', 'aria-label': 'Remove Node' });

		// Assemble the node
		div.append(selectContainer, addChildButton, addBroRightButton, addBroLeftButton, removeNodeButton);
		li.appendChild(div);

		if (with_ul) li.appendChild(ul);

		return li;
	},

	createGroupSelectField: function () {
		const selectContainer = this.createHtmlElement('div', { 'class': 'splcp-link-field' });
		const fieldsetDiv = this.createHtmlElement('div', { 'class': 'spf-field spf-depend-on spf-field-select sptp_chart_member_ids' });
		const titleDiv = this.createHtmlElement('div', { 'class': 'spf-title' }, this.createHtmlElement('h4', {}, 'Select Member'));
		const fieldset = this.createHtmlElement('div', { 'class': 'spf-fieldset' });
		const select = this.createHtmlElement('select', {
			'name': '_sptp_generator_layout[sptp_chart][sptp_chart_member_ids]',
			'data-depend-id': 'sptp_chart_member_ids'
		});

		// Add default option
		const defaultOption = this.createHtmlElement('option', { value: '' }, 'Select Member');
		// select.appendChild(defaultOption);

		// Dynamically fetch options from the existing select element
		var options = jQuery('#sp-team-member-tree' + postId + ' > ul > li select').first().find('option');
		// Members already picked anywhere in the tree. Saved nodes, the first
		// unsaved node and nodes added here each carry a different `name`, so
		// match every select in the tree rather than one name.
		var selectedValues = jQuery('#sp-team-member-tree' + postId + ' select').find('option:selected').map(function () {
			return jQuery(this).val(); // Store the selected values
		}).get();

		// Iterate through the options and add them to the new select field
		options.each(function () {
			var $this = jQuery(this);
			var value = $this.val();
			var text = $this.text();
			// Check if the option's value is not in the selected values
			if (!selectedValues.includes(value)) {
				// Create a new option element and append it to the new select field
				const option = document.createElement('option');
				option.value = value;
				option.text = text;
				select.appendChild(option);
			}
		});

		fieldset.appendChild(select);
		fieldsetDiv.appendChild(titleDiv);
		fieldsetDiv.appendChild(fieldset);
		selectContainer.appendChild(fieldsetDiv);
		return selectContainer;
	},

	enableSorting: function () {
		const treeSelector = `#${this.ids.tree} ul`; // Cache the selector

		jQuery(treeSelector).sortable({
			items: '> li', // Only allow sorting of sibling <li> elements
			placeholder: 'ui-state-highlight',

			start: function (event, ui) {
				// Optionally, add visual feedback when sorting starts
				ui.placeholder.height(ui.helper.outerHeight()); // Ensure placeholder matches the height of dragged item
			},

			update: function () {
				// The new order is saved with the post: refresh the tree JSON.
				syncTreeData();
			}
		}).disableSelection();
	},

    createHtmlElement: function (tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
    
        // Set attributes
        for (const attr in attributes) {
            element.setAttribute(attr, attributes[attr]);
        }
    
        // Handle different content types
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
        }
    
        return element;
    }    
};

/**
 * Write the tree as it stands into the hidden `sptp_chart_node` field.
 *
 * Runs after every edit (add, remove, sort, member pick) and on Publish, so
 * both a save and Show Preview — which posts the form as it is — send the
 * current tree, never the one loaded with the page.
 */
function syncTreeData() {
	var postId = jQuery('.sp-team-org-chart-container').data('id');
	var $tree = jQuery('#sp-team-member-tree' + postId);
	if (!$tree.length) {
		return;
	}
	var treeData = [];
	$tree.children('ul').children('li').each(function () {
		treeData.push(buildTreeData(jQuery(this)));
	});
	$tree.parents('.spf-section').find('.sptp_chart_node input').val(JSON.stringify(treeData));
}

jQuery(document).on('click', '#publishing-action', syncTreeData);
jQuery(document).on('change', '.sp-team-org-chart-container select', syncTreeData);

// Initialize the tree chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
	sp_team_chart.start();
	sp_team_chart_content_loaded = true;

	updateTreeButtons();
	syncTreeData();
});

// Function to recursively build tree data
function buildTreeData($element) {
	var selectedValue = $element.children('.sp-team-member-tree-node').find('select').val();
	var children = [];
	// Recursively process each child node (if there is a nested UL with LI children)
	$element.children('ul').children('li').each(function () {
		var childData = buildTreeData(jQuery(this));
		children.push(childData);
	});

	// Return the current node with its selected value and children array
	return {
		id: selectedValue,
		children: children
	};
}

/**
 * Function to update the visibility of buttons based on the number of siblings.
 */
function updateTreeButtons() {
	const $treeRoot = jQuery('.sp-team-org-chart-container');

	// Loop through each <ul> and check button visibility based on the number of <li> elements.
	$treeRoot.find('ul').each(function () {
		const $thisUL = jQuery(this);
		const siblingCount = $thisUL.children('li').length;

		// Sibling no more than 2.
		if ( siblingCount >= 10 ) {
			$thisUL.find('.add_bro_right, .add_bro_left').hide();
			$treeRoot.find('.add_child_button, .add_bro_right, .add_bro_left').hide();
		} else {
			$thisUL.find('.add_bro_right, .add_bro_left').show();
		}

		// Parent no more than 5.
		if ( $treeRoot.find('ul').length >= 3 ) {
			$thisUL.find('.add_child_button').hide();
		} else {
			$thisUL.find('.add_child_button').show();
		}
	});
}
