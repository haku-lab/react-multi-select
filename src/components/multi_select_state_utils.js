export const findItem = ({ id }, items) => items.find(item => id === item.id);

const shouldSelectItem = (item, itemsToSelect) =>
  !item.disabled && findItem(item, itemsToSelect);

const getSourceItems = (itemsToSelect, selectedItems, items) =>
  items.filter(
    item =>
      shouldSelectItem(item, itemsToSelect) || findItem(item, selectedItems)
  );

const getDestinationItems = (itemsToSelect, selectedItems, items) =>
  selectedItems.filter(
    selectedItem =>
      !findItem(selectedItem, itemsToSelect) && !findItem(selectedItem, items)
  );

const notContainsId = (ids, item) =>
  ids.find(id => id === item.id) === undefined;

export const filterUnselectedByIds = (items, ids, isLocked) =>
  items.filter(item => notContainsId(ids, item) || isLocked(item));

export const getSelectedByAllItems = (itemsToSelect, selectedItems, items) => {
  const sourceItems = getSourceItems(itemsToSelect, selectedItems, items);
  const destinationItems = getDestinationItems(
    itemsToSelect,
    selectedItems,
    items
  );

  return [...destinationItems, ...sourceItems];
};

export const getMinMaxIndexes = (currentIndex, firstItemShiftSelected) =>
  firstItemShiftSelected > currentIndex
    ? { minIndex: currentIndex, maxIndex: firstItemShiftSelected }
    : { minIndex: firstItemShiftSelected, maxIndex: currentIndex };

export const isWithin = (index, { minIndex, maxIndex }) =>
  index >= minIndex && index <= maxIndex;

export const getNewSelectedItems = (
  itemId,
  items,
  selectedItems,
  keepSelectionOrder
) => {
  let alreadySelectedItems = [];
  let sourceItems = [];

  if (keepSelectionOrder) {
    // In order to keep selection order on the list,
    // First, iterate threw already selectedItems
    alreadySelectedItems = selectedItems.filter(item => findItem(item, items));
    sourceItems = items.filter(item => item.id === itemId);
  } else {
    alreadySelectedItems = selectedItems.filter(
      selectedItem => !findItem(selectedItem, items)
    );
    sourceItems = items.filter(
      item => item.id === itemId || findItem(item, selectedItems)
    );
  }

  return [...alreadySelectedItems, ...sourceItems];
};
