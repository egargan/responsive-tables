class ResponsiveTable {
    constructor(table) {
        var tableColumnCount = table.rows[0].cells.length;
        this.columns = [];

        for (let i = 0; i < tableColumnCount; i++) {
            this.columns.push(new PriorityColumn(table, i));
        }

        this.prioritySortColumns(this.columns);

        // Index of the column we'll be hiding next when we need to
        this.nextColToHideIndex = 0;

        const container = table.parentElement;
        const instance = this;

        new ResizeSensor(container, function() {
            const containerWidth = instance.getContainerInnerWidth(container);

            if (containerWidth <= tableElement.clientWidth) {
                // Loop until we've remove enough columns
                while (containerWidth <= tableElement.clientWidth) {
                    instance.hideNextColumn();
                }
            }
            else if (instance.nextColToHideIndex > 0 &&
                instance.isRoomToUnhideNextColumn(containerWidth)) {
                instance.unhideNextColumn();
            }
        });
    }

    // Sorts PriorityColumn elements in the given array by their priority values,
    // subsorting by their initial index such that right-most columns are hidden first.
    prioritySortColumns(unsortedColumns) {
        unsortedColumns.sort(function(a, b) {
            if (a.priority == b.priority) {
                return -1;
            }
            else {
                return (a.priority > b.priority) ? 1 : -1;
            }
        });
    }

    hideNextColumn() {
        if (this.nextColToHideIndex >= this.columns.length) {
            console.error('No more columns to hide!');
            return;
        }

        this.columns[this.nextColToHideIndex].hide();
        this.nextColToHideIndex++;
    }

    unhideNextColumn() {
        if (this.nextColToHideIndex == 0) {
            console.error('All columns are visible!');
            return;
        }

        this.nextColToHideIndex--;
        this.columns[this.nextColToHideIndex].show();
    }

    isRoomToUnhideNextColumn(containerWidth) {
        return containerWidth - tableElement.clientWidth >
            this.columns[this.nextColToHideIndex - 1].lastRecordedWidth;
    }

    getContainerInnerWidth(containerElement) {
        const computedStyle = window.getComputedStyle(containerElement, null);

        const leftRightPadding =
            parseInt(computedStyle.getPropertyValue('padding-left')) +
            parseInt(computedStyle.getPropertyValue('padding-right'));

        return containerElement.clientWidth - leftRightPadding;
    }
}

class PriorityColumn {
    constructor(table, columnIndex) {
        this.columnElements = [];

        // Get 'header' cell at top of column, where we expect a priority value
        var headerCell = table.rows[0].cells[columnIndex];
        this.priority = parseInt(headerCell.dataset.priority);

        // Keep an updated width reading so we know if we can
        // fit this column back into the table
        this.lastRecordedWidth = headerCell.clientWidth;

        // Assign default priority if we couldn't find one
        if (this.priority == null) {
            this.priority = 0;
        }

        for (var row of table.rows) {
            this.columnElements.push(row.cells[columnIndex]);
        }
    }

    hide() {
        this.lastRecordedWidth = this.columnElements[0].clientWidth;

        this.columnElements.forEach(cell => {
            cell.style.display = "none";
        });
    }

    show() {
        this.columnElements.forEach(cell => {
            cell.style.display = "";
        });
    }
}

for (var tableElement of document.getElementsByClassName("responsive-table")) {
    new ResponsiveTable(tableElement);
}
