import i18n from '@dhis2/d2-i18n'
import {
    Button,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { areListsEqual } from '../../utils/array-utils.js'
import css from './category-option-select.module.css'
import MenuSelect from './menu-select.js';
// import { useSelectionContext } from '../../selection-context/use-selection-context.js'

/**
 * 
 * @param categoryCombo An object which has an array of category objects (JSON), each options (to be rendered in a menu).
 * @param orgUnit An object
 * @param selected An Object of categoryOptionCombo
 * @param onChange A function to handle changes in the selected options.
 * @param onClose A function to close the menu.
 * 
 */
export default function CategoyOptionSelect({
    categoryCombo,
    orgUnit,
    selected,
    onChange,
    onClose,
}) {
    const [selectedItem, setSelectedItem] = useState({})
    
    // Get the selected categories if any
    const getSelectedCategories = () => {
        const initCategories = {}
        
        if (!selected) {
            return initCategories
        }
        
        const catOptionIds = selected.categoryOptions.map((item => item.id))
        // Go through "Categories" of catCombo to find "CategoryOption" we need
        for( var j=0; j< categoryCombo.categories.length; j++ ) {
            const category = categoryCombo.categories[j]
            const foundCatOptions = category.categoryOptions.filter((item => catOptionIds.includes(item.id)))
            if( foundCatOptions.length > 0 ) {
                initCategories[category.id] = foundCatOptions[0].id
            }
        }
        
        return initCategories
    }
    
    useEffect(() => {
        setSelectedItem(getSelectedCategories())
    }, [])
    
    const categoryItemOnChange = (categoryId, selectedOptionId) => {
        let updatedSelected = {}
        if( selected ) {
            updatedSelected[categoryId] = selectedOptionId
        }
        else {
            updatedSelected = { ...selectedItem, [categoryId]: selectedOptionId }
        }
        setSelectedItem(updatedSelected)
        
        const selectedCatOptionCombo = findCategoryOptionCombo(updatedSelected)
        onChange(selectedCatOptionCombo)
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
        
        return;
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
                
                {/* Categories Dropdown */}
                {categories.map(({ id, displayName, categoryOptions }) => 
                    categoryOptions.length === 0 ? (
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
                        <div className={css.inputWrapper} key={id}>
                            <SingleSelectField
                                label={displayName} // The category's displayName.
                                selected={selectedItem[id]} // Current selected option ID.
                                onChange={({ selected }) => categoryItemOnChange(id, selected)}
                            >
                                {categoryOptions.map(({ id, displayName }) => (
                                    <SingleSelectOption
                                        key={id}
                                        value={id}
                                        label={displayName}
                                        className={css.dropdown}
                                    />
                                ))}
                            </SingleSelectField>
                        </div>
                    )
                )}
               
            </div>
            
            <Button
                secondary
                className={css.hideButton}
                onClick={(_, evt) => {
                    // required as otherwise it'd trigger a `setOpen(true)` call as
                    // react thinks of this dropdown as being inside of the
                    // selector. A click on the selector opens the menu.
                    evt.stopPropagation()

                    onClose()
                }}
            >
                {i18n.t('Hide menu')}
            </Button>
            
        </div>
    )
}

CategoyOptionSelect.propTypes = {
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
    onClose: PropTypes.func.isRequired,
    selected: PropTypes.object,
}


const getCategoriesWithOptionsWithinOrgUnit = (categoryCombo, orgUnitId) => {
    if (!categoryCombo || !orgUnitId) {
        return []
    }
    
    const categories = categoryCombo.categories
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
    
    return result;
}



const isOptionAssignedToOrgUnit = ({ categoryOption, orgUnitId }) => {
    // by default,
    if (!categoryOption?.organisationUnits?.length) {
        return true;
    }
    return categoryOption?.organisationUnits.includes(orgUnitId);
}