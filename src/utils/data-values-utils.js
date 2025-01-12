export const resolveDataValues = (dataElements, dataValues) =>  {
    return dataElements.map((de) => {
        // Filter values corresponding to the current data element
        const valuesForDE = dataValues.filter((dv) => dv.dataElement === de.id);
        
        // Calculate the total value or assign an empty string if no values exist
        const totalValue = valuesForDE.length > 0 
          ? valuesForDE.reduce((sum, dv) => sum + parseFloat(dv.value), 0)
          : "";
        
        // Return the desired structure
        return {
          name: de.displayName,
          value: totalValue, // Set to an empty string if no values are found
        };
    });
}