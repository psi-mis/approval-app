import i18n from '@dhis2/d2-i18n'
import { Divider, SingleSelect, SingleSelectField, SingleSelectOption} from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../app-context/use-app-context.js'
import { useSelectionContext } from '../../selection-context/index.js'
import { cloneJSON, findObject } from '../../utils/array-utils.js'
import { getCategoryComboByCategoryOptionCombo, getCategoryCombos, getCategoryOptionComboById, getCategoryOptionsByCategoryOptionCombo } from '../../utils/caterogy-combo-utils.js'
import { ContextSelect } from '../context-select/context-select.js'
import css from './attribute-combo-select.module.css'
import CategoyOptionSelect from './category-option-select.js'


const CAT_OPTION_COMBO = 'CAT_OPTION_COMBO';

const AttributeComboSelect = () => {
    const { metadata } = useAppContext()
    const { workflow, orgUnit, period, openedSelect, setOpenedSelect, attributeOptionCombo, selectAttributeOptionCombo } = useSelectionContext();
        
    const open = openedSelect === CAT_OPTION_COMBO
    const [attributeCombos, setAttributeCombos] = useState([])
    const [attrComboValue, setAttrComboValue] = useState("")
    const [selectedAttributeCombo, setSelectedAttributeCombo] = useState(null)
    const [showed, setShowed] = useState(true)
    
    const processCategoryOptions = (metadata, optionComboId) => {
        return getCategoryOptionsByCategoryOptionCombo(metadata, optionComboId).reduce(
            (acc, option, index) => {
                acc[index] = option.id;
                return acc;
            },
            {}
        );
    };
    
    const initializeSelectedAttributeCombo = (metadata, optionComboId) => {
        const selectedAttrCombo = getCategoryComboByCategoryOptionCombo(metadata, optionComboId);
        const selectedAttrOptionCombo = getCategoryOptionComboById(metadata, optionComboId);
        const categoryOptions = processCategoryOptions(metadata, optionComboId);
    
        return { value: getAttributeOptionComboValue(selectedAttrCombo, categoryOptions), attributeCombo: selectedAttrCombo, attributeOptionCombo: selectedAttrOptionCombo }
    }
    
    const handleSingleCategoryCombo = (_attributeCombos) => {
        const singleCategoryCombo = _attributeCombos[0];
        // setSelectedAttributeCombo(singleCategoryCombo);
    
        if (singleCategoryCombo.categoryOptionCombos.length === 1) {
            const defaultOptionCombo = singleCategoryCombo.categoryOptionCombos[0];
            // selectAttributeOptionCombo(defaultOptionCombo);
            return { isVisible: false, value: i18n.t('1 selection'), attributeCombo: singleCategoryCombo, attributeOptionCombo: defaultOptionCombo };
        }
    
        return { isVisible: true, value: i18n.t('0 selections'), attributeCombo: singleCategoryCombo };
    };
    
    const resetAttributeComboState = () => {
        return { isVisible: false, value: i18n.t('0 selections'), attributeCombo: null };
    };
    
    useEffect(() => {
        // Fetch and set the category combos
        const _attributeCombos = getCategoryCombos(metadata, workflow)
        setAttributeCombos(_attributeCombos)
        
        let _attributeCombo = null
        let _attributeOptionCombo = null
        
        // // Reset selected attribute option combo
        // selectAttributeOptionCombo(null)
    
        let isShowAttributeComboVisible = true;
        let attributeComboValue = i18n.t('0 selections')
        if (_attributeCombos.length === 0) {
            // Handle the case for no category combos
            const result = resetAttributeComboState()
            _attributeCombo = result.attributeCombo
            isShowAttributeComboVisible = result.isVisible;
            attributeComboValue = result.value;
        }
        else if (_attributeCombos.length === 1) {
            // Handle the case for a single category combo
            const result = handleSingleCategoryCombo(_attributeCombos)
            _attributeCombo = result.attributeCombo
            _attributeOptionCombo = result.attributeOptionCombo
            isShowAttributeComboVisible = result.isVisible
            attributeComboValue = result.value
        }
        else if (attributeOptionCombo) {
            // Initialize with the existing attribute option combo
            const result = initializeSelectedAttributeCombo(metadata, attributeOptionCombo.id);
            _attributeCombo = result.attributeCombo
            _attributeOptionCombo = result.attributeOptionCombo
            attributeComboValue = result.value
        }
        else {
            _attributeOptionCombo = null
            // setSelectedAttributeCombo(null)
        }
    
        // Update states only if values have changed
        setSelectedAttributeCombo(_attributeCombo);
        selectAttributeOptionCombo(_attributeOptionCombo);
        setShowed((prev) => (prev !== isShowAttributeComboVisible ? isShowAttributeComboVisible : prev));
        setAttrComboValue((prev) => (prev !== attributeComboValue ? attributeComboValue : prev));
    }, [workflow]);
    
    const onChange = (selectedAttrCombo, selectedCategoryItems, selectedAttrOptionCombo) => {
        selectAttributeOptionCombo(selectedAttrOptionCombo)
        setAttrComboValue(getAttributeOptionComboValue(selectedAttrCombo, selectedCategoryItems))
    }
    
    const getAttributeOptionComboValue = (selectedAttrCombo, selectedCategoryItems) => {
        if (selectedAttrCombo?.isDefault) {
            return ''
        }
        
        if (
            !Object.values(selectedCategoryItems).length ||
            !selectedAttrCombo
        ) {
            return i18n.t('0 selections')
        }
        
        if (selectedCategoryItems.length === 1) {
            const categoryId = selectedAttrCombo?.categories[0]
            const category = selectedAttrCombo.categories.find((item => item.id == categoryId))
            return category?.displayName
        }
    
        const amount = Object.values(selectedCategoryItems).length
    
        if (amount === 1) {
            return i18n.t('1 selection')
        }
    
        return i18n.t('{{amount}} selections', {
            amount: Object.values(selectedCategoryItems).length,
        })
    }
    
    const onChangeCatCombo = (catComboId) => {
        const catCombo = findObject(attributeCombos, "id", catComboId)
        
        // Update the selected attribute combo and reset attribute combo value
        setSelectedAttributeCombo(catCombo)
        setAttrComboValue(i18n.t('0 selections'))
        
        // Automatically select the default option combo if applicable
        if( catCombo.isDefault ) {
            selectAttributeOptionCombo(catCombo.categoryOptionCombos[0])
        }
    }
    console.log("=== attributeOptionCombo: ", attributeOptionCombo)
    return (
        <>
            {showed && <ContextSelect 
                dataTest="category-combo-context-select"
                prefix={selectedAttributeCombo?.displayName || i18n.t('Category Option Combo')}
                placeholder={attrComboValue || i18n.t('Choose a category option combo')}
                open={open}
                disabled={!(workflow?.id && period?.id && orgUnit?.id )}
                onOpen={() => setOpenedSelect(CAT_OPTION_COMBO)}
                onClose={() => setOpenedSelect('')}
                popoverMaxWidth={400}
            >
                {/* Renders a SingleSelectField for each category */}
                <div className={css.menu} style={{height: attributeCombos.length == 1 ? "250px" : "330px"}}>
                    {/* Only show Category Combo dropdown when there are more than one categoryCombo in the list */}
                    {attributeCombos.length > 1 && <div className={css.attributeComboSelect }>
                        <SingleSelect
                            placeholder={i18n.t('Choose a combination')}
                            selected={selectedAttributeCombo?.id}
                            onChange={({selected}) => onChangeCatCombo(selected)}
                        >
                            {attributeCombos.map((catCombo) => (
                                <SingleSelectOption
                                    key={catCombo.id}
                                    value={catCombo.id}
                                    label={catCombo.displayName}
                                />
                            ))}
                        </SingleSelect>
                        <Divider className={css.divider} />
                    </div>}
                
                    {selectedAttributeCombo && (!selectedAttributeCombo.isDefault ) &&
                        <CategoyOptionSelect
                            key={`catCombo_${selectedAttributeCombo.id}`} 
                            categoryCombo={selectedAttributeCombo}
                            orgUnit={orgUnit}
                            selected={attributeOptionCombo}
                            onChange={onChange}
                            onClose={() => setOpenedSelect('')}
                        />}
                
                </div>
            </ContextSelect>}
        </>
    )
}

export { AttributeComboSelect, CAT_OPTION_COMBO }