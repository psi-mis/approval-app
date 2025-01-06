import i18n from '@dhis2/d2-i18n'
import {
    Button,
    IconChevronDown24,
    IconChevronUp24,
    NoticeBox,
    SingleSelect,
    SingleSelectOption,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { areListsEqual, cloneJSON } from '../../utils/array-utils.js'
import css from './category-combo-menu.module.css'
import MenuSelect from './menu-select.js';

/**
 * 
 * @param categoryCombo An object which has an array of category objects (JSON), each options (to be rendered in a menu).
 * @param orgUnit An object
 * @param selected An object mapping category IDs to their selected option IDs. 
 *          Example for an selected:  {
 *                      "category1": "option1",
 *                      "category2": "option2",
 *                      "category3": "option5",
 *                  }
 * @param onChange A function to handle changes in the selected options.
 * 
 */
export default function CategoyComboMenu({
    categoryCombo,
    orgUnit,
    selected,
    onChange,
}) {
    const [showCategories, setShowCategories] = useState(false);
    const [selectedItem, setSelectedItem] = useState(selected || {});
    
    const categoryItemOnChange = (categoryId, selectedOptionId) => {
        const tempSelected = cloneJSON(selectedItem)
        if( selectedItem[categoryId] ) {
            delete selectedItem[categoryId]
        }
        tempSelected[categoryId] = selectedOptionId
        setSelectedItem(tempSelected)
        
        const catOptionCombo = findCategoryOptionCombo(tempSelected)
        if( catOptionCombo )
        {
            onChange(tempSelected, catOptionCombo)
        }
    }
    
    const findCategoryOptionCombo = (selectedItem) => {
        const selectedCatOptionIds = Object.values(selectedItem)
        const catOptionComboList = categoryCombo.categoryOptionCombos
        for( let i=0; i<catOptionComboList.length; i++ ) {
            const catOptionCombo = catOptionComboList[i]
            const catOptionIds = catOptionCombo.categoryOptions.map((item) => item.id)
            if( areListsEqual(selectedCatOptionIds, catOptionIds) ) {
                return catOptionCombo;
            }
        }
        
        return null;
    }
    
    // Checks if there's exactly one category in the categories array and that category has at least one categoryOption
    const categories = getCategoriesWithOptionsWithinOrgUnit(categoryCombo, orgUnit?.id);
    if (categories.length === 1 && categories[0].categoryOptions?.length > 0) {
        // Extracts the single category from the categories array
        const category = categories[0]
        // Maps categoryOptions into a JSON array with value (ID) and label (displayName)
        const values = category.categoryOptions.map(({ id, displayName }) => ({
            value: id,
            label: displayName,
        }))

        // Renders a MenuSelect for the single category
        return (
            <MenuSelect
                values={values} // List of options
                selected={selectedItem[category.id]} // Current selected option for the category.
                // selected={!selected ? selected[category.id]: ""} // Current selected option for the category.
                dataTest="data-set-selector-menu" // Identifier for testing purposes
                onChange={({ selected: categoryOptionId }) => { // Handles when an option is selected
                    onChange({
                        categoryId: category.id,
                        selected: categoryOptionId,
                    })
                }}
            />
        )
    }

    return (
        <div className={css.container}>
            <div className={css.inputs}>
                <div className={css.containerTitle}>
                    <div className={css.title}>{categoryCombo.displayName}</div>
                    <Button
                        small
                        onClick={() => setShowCategories(!showCategories)}
                            icon={showCategories ? <IconChevronUp24 /> : <IconChevronDown24 />}
                        >
                    </Button>
                </div>
                
                {/* Iterates over the categories array to render inputs for each category. */}
                {showCategories && categories.map(({ id, displayName, categoryOptions }) => {
                    // If categoryOptions is empty, displays a NoticeBox with an error message saying no options are available.
                    return categoryOptions.length === 0 ? (
                        <NoticeBox
                            className={css.noOptionsBox}
                            error
                            title={i18n.t('No available options')}
                        >
                            {i18n.t(
                                `There are no options for {{categoryName}} for the selected period or organisation unit.`,
                                { categoryName: displayName }
                            )}
                        </NoticeBox>
                    ) : (
                        // Renders a SingleSelectField for each category
                        <div className={css.input} key={id}>
                            <SingleSelect
                                label={displayName} // The category's displayName.
                                selected={selectedItem[id]} // Current selected option ID.
                                onChange={({ selected }) => categoryItemOnChange(id, selected)}
                            >
                                {categoryOptions.map(({ id, displayName }) => (
                                    <SingleSelectOption
                                        key={id}
                                        value={id}
                                        label={displayName}
                                    />
                                ))}
                            </SingleSelect>
                        </div>
                    )
                })}
            </div>

            {/* Hide Menu Button */}
            {/* <Button
                secondary
                onClick={(_, evt) => {
                    evt.stopPropagation(); // Stops event propagation to avoid conflicts with other click handlers.
                    close(); // Calls close() to close the menu.
                }}
            >
                {i18n.t('Hide menu')}
            </Button> */}
        </div>
    )
}

CategoyComboMenu.propTypes = {
    categoryCombo: PropTypes.shape({
        categories: PropTypes.arrayOf(
            PropTypes.shape({
                categoryOptions: PropTypes.arrayOf(
                    PropTypes.shape({
                        displayName: PropTypes.string.isRequired,
                        id: PropTypes.string.isRequired,
                    })
                ).isRequired,
                displayName: PropTypes.string.isRequired,
                id: PropTypes.string.isRequired,
            })
        ).isRequired,
        categoryOptionCombos: PropTypes.arrayOf(
            PropTypes.shape({
                categoryOptions: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.string.isRequired,
                    })
                ).isRequired,
                displayName: PropTypes.string.isRequired,
                id: PropTypes.string.isRequired,
            }),
        ).isRequired,
        displayName: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
    }).isRequired,
    
    orgUnit: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    selected: PropTypes.objectOf(PropTypes.string)
}


const getCategoriesWithOptionsWithinOrgUnit = (categoryCombo, orgUnitId) => {
    if (!categoryCombo || !orgUnitId) {
        return []
    }
    const categories = categoryCombo.categories;
    // const categoryOptions = categories?.flatMap(category => category.categoryOptions || []);
    
    const result = (categories || []).map((category) => ({
        ...category,
        categoryOptions: category.categoryOptions.filter(
            (categoryOption) =>
                isOptionAssignedToOrgUnit({
                    categoryOption,
                    orgUnitId,
                })
        ),
    }));
    
    console.log("getCategoriesWithOptionsWithinPeriodWithOrgUnit", result);
    return result;
}



const isOptionAssignedToOrgUnit = ({ categoryOption, orgUnitId }) => {
    // by default,
    if (!categoryOption?.organisationUnits?.length) {
        return true;
    }
    return categoryOption?.organisationUnits.includes(orgUnitId);
}