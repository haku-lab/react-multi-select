import React, { PureComponent } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { LinearProgress } from "material-ui/Progress";
import styles from "./react_multi_select.scss";
import {
  filterItems,
  unionItemsForListToList
} from "./react_multi_select_utils";
import {
  DESTINATION_HEADER_CLEAR_ALL,
  DESTINATION_HEADER_NONE,
  DESTINATION_HEADER_SELECT_ALL,
  DESTINATION_HEADER_SELECTED,
  DESTINATION_NO_ITEMS,
  SOURCE_NO_ITEMS,
  SOURCE_SEARCH_PLACEHOLDER
} from "./react_multi_select_messages";
import Checkbox from "material-ui/Checkbox";
import { FormControlLabel } from "material-ui/Form";
import MultiSelectionList from "./multi_selection_list/multiselection_list";

export const ITEMS_LIST_HEIGHT = 320;
export const SELECTED_ITEMS_LIST_HEIGHT = 360;
export const LIST_ROW_HEIGHT = 40;

const displayItem = ({ isItemSelected }) => item => {
  return (
    <FormControlLabel
      className={styles.checkbox_control}
      control={<Checkbox value={item.label} checked={isItemSelected(item)} />}
      label={item.label}
    />
  );
};

const displaySelectedItem = item => (
  <div className={styles.dst_item_content}>
    <div className={styles.dst_item_text}>{item.label}</div>
    <span className={styles.remove_button} />
    <div>Clear icon</div>
  </div>
);

export default class ReactMultiSelect extends PureComponent {
  constructor(props) {
    super(props);

    const { items } = props;

    this.state = { selectedItems: [], items, filteredItems: items };

    this.onClear = this.onClear.bind(this);
    this.select = this.select.bind(this);
    this.deselectItem = this.deselectItem.bind(this);
    this.isItemSelected = this.isItemSelected.bind(this);
    this.setSelectedItems = this.setSelectedItems.bind(this);
    this.renderDestinationInfo = this.renderDestinationInfo.bind(this);
    this.renderDestinationList = this.renderDestinationList.bind(this);
    this.renderSourceList = this.renderSourceList.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { items, selectedItems } = nextProps;
    this.props.selectedItems.length !== selectedItems.length &&
      this.setSelectedItems(selectedItems);
    this.setState({
      items,
      filteredItems: items
    });
  }

  onClear() {
    if (this.state.selectedItems.length) {
      this.setSelectedItems([]);
      this.props.onChange([]);
    }
  }

  setSelectedItems(selectedItems) {
    this.setState({ selectedItems }, () => {
      if (this.props.onChange) {
        this.props.onChange(selectedItems);
      }
    });
    this.srcList &&
      this.srcList.changeSelectedState(selectedItems.map(({ id }) => id));
  }

  select(selectedIds) {
    const unionSelectedItems = unionItemsForListToList(
      selectedIds,
      this.state.items,
      this.props.selectedItems
    );

    this.setSelectedItems(unionSelectedItems);
  }

  deselectItem(ids) {
    if (ids.length) {
      this.setSelectedItems(
        this.state.selectedItems.filter(item => !ids.includes(item.id))
      );
    }
  }

  isItemSelected(item) {
    return this.state.selectedItems.map(({ id }) => id).includes(item.id);
  }

  displaySelectAll = selectedAll => {
    return (
      <FormControlLabel
        className={styles.checkbox_control}
        control={<Checkbox checked={selectedAll} />}
        label={this.props.messages[DESTINATION_HEADER_SELECT_ALL]}
      />
    );
  };

  renderDestinationInfo() {
    const { selectedHeaderClassName, messages } = this.props;

    const { selectedItems } = this.state;

    return (
      <div
        className={classnames(styles.selected_header, selectedHeaderClassName)}
      >
        <div>
          {`${selectedItems.length || messages[DESTINATION_HEADER_NONE]} ` +
            messages[DESTINATION_HEADER_SELECTED]}
        </div>
        <div onClick={this.onClear} role="button" className={styles.clear_all}>
          {messages[DESTINATION_HEADER_CLEAR_ALL]}
        </div>
      </div>
    );
  }

  componentDidMount() {
    if (this.props.selectedItems && this.props.selectedItems.length > 0) {
      this.setSelectedItems(this.props.selectedItems);
    }
  }

  renderDestinationList() {
    const {
      messages,
      errors,
      listRowHeight,
      selectedListHeight,
      dstItemsWrapperClassName
    } = this.props;
    const { selectedItems } = this.state;

    return (
      <MultiSelectionList
        withSearch={false}
        withSelectAll={false}
        items={selectedItems}
        onSelect={this.deselectItem}
        error={errors.dest}
        isVirtualized={true}
        listHeight={selectedListHeight}
        listRowHeight={listRowHeight}
        emptyText={messages[DESTINATION_NO_ITEMS]}
        displayFn={displaySelectedItem}
        className={classnames(
          styles.dst_items_wrapper,
          dstItemsWrapperClassName
        )}
        itemClassName={styles.dst_item}
        selectedItemClassName={styles.selected_dst_item}
      />
    );
  }

  renderSourceList() {
    const {
      messages,
      errors,
      listHeight,
      listRowHeight,
      searchFilterDelay,
      showSearch,
      showSelectAll,
      searchInputClassName,
      selectAllClassName,
      sourceItemsWrapperClassName
    } = this.props;
    const { filteredItems } = this.state;

    return (
      <MultiSelectionList
        ref={list => (this.srcList = list)}
        items={filteredItems}
        onSelect={this.select}
        withSearch={showSearch}
        withSelectAll={showSelectAll}
        displayFn={displayItem({ isItemSelected: this.isItemSelected })}
        filterFn={filterItems}
        displaySelectAllFn={this.displaySelectAll}
        error={errors.src}
        filterSelected={false}
        isVirtualized={true}
        listHeight={listHeight}
        listRowHeight={listRowHeight}
        msDelayOnChangeFilter={searchFilterDelay}
        searchPlaceholder={messages[SOURCE_SEARCH_PLACEHOLDER]}
        emptyText={messages[SOURCE_NO_ITEMS]}
        searchWrapperClassName={styles.search_wrapper}
        searchInputClassName={classnames(
          styles.search_input,
          searchInputClassName
        )}
        searchIconClassName={styles.search_icon}
        selectAllClassName={classnames(styles.select_all, selectAllClassName)}
        className={classnames(
          styles.source_items_wrapper,
          sourceItemsWrapperClassName
        )}
        itemClassName={styles.source_item}
        selectedItemClassName={styles.selected_source_item}
      />
    );
  }

  render() {
    const { loading, wrapperClassName } = this.props;

    return (
      <div className={classnames(styles.wrapper, wrapperClassName)}>
        <div className={styles.source_list}>{this.renderSourceList()}</div>
        <div className={styles.destination_list}>
          {this.renderDestinationInfo()}
          {this.renderDestinationList()}
        </div>
        {loading && (
          <div className={styles.loader_container}>
            <LinearProgress color="primary" />
          </div>
        )}
      </div>
    );
  }
}

ReactMultiSelect.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      value: PropTypes.string,
      label: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
        .isRequired,
      icons: PropTypes.arrayOf(PropTypes.string)
    })
  ).isRequired,
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      value: PropTypes.string,
      label: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
        .isRequired,
      icons: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  loading: PropTypes.bool,
  messages: PropTypes.object,
  errors: PropTypes.object,
  onChange: PropTypes.func,
  showSearch: PropTypes.bool,
  showSelectAll: PropTypes.bool
};

ReactMultiSelect.defaultProps = {
  items: [],
  selectedItems: [],
  errors: {
    src: {},
    dest: {}
  },
  showSearch: true,
  showSelectAll: true,
  listHeight: ITEMS_LIST_HEIGHT,
  selectedListHeight: SELECTED_ITEMS_LIST_HEIGHT,
  listRowHeight: LIST_ROW_HEIGHT
};