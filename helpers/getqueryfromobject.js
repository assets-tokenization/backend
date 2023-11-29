exports.GET_QUERY_PG_INTO_FROM_OBJECT = (table, object, types) => {

    const fields = Object.keys(object);

    const values = fields.map(el=>{
        console.log('el', el);
        if(types[el] == 'arrayreal') return `ARRAY ${JSON.stringify(object[el])}`;
        if(types[el] != 'number' && types[el] != 'boolean') return object[el] && object[el].length > 0 ? "'" + object[el].replace(/'/g,"''") + "'" : "NULL";
        if(types[el] == 'boolean' && typeof object[el] === "boolean") return object[el] ? 'TRUE':'FALSE'; 
        return object[el] || 'NULL';
    });

    const statement =  `INSERT INTO ${table} 
                                ( ${fields.join(', ')} )
                            VALUES  ( ${values.join(', ')}) RETURNING id`
    return statement;
}

exports.GET_QUERY_PG_INTO_FROM_OBJECTS_ARRAY = (table, arr_ob, types) => {

    const fields = Object.keys( types );

    const prep_val = arr_ob.map(object=>{
            const values = fields.map(el=>{
                if(types[el] == 'days') return (typeof object[el]) == 'string' ? `'${object[el]}'` : object[el] > 0 ? `'${object[el].toString()}'` : '0';
                if(types[el] != 'number' && types[el] != 'money' && [el] != 'boolean') return object[el] && object[el].length > 0 ? "'" + object[el].replace(/'/g,"''") + "'" : "NULL";
                if(types[el] == 'boolean' && typeof object[el] === "boolean") return object[el] ? 'TRUE':'FALSE';
                if(types[el] == 'money' ) return object[el] ? `'${+object[el].toFixed(2)}'` : 0;
                return object[el] ? `'${object[el]}'` : 0;
            });

            return `( ${values.join(', ')} )`
    });

    const statement =  `INSERT INTO ${table} 
                                ( ${fields.join(', ')} )
                            VALUES  ${prep_val.join(",")}`
    return statement;
}

exports.GET_QUERY_PG_UPDATE_FROM_OBJECT_BY_ID = (table, object, types) => {

    
    const { id } = object;

    if (!id) return null;
    
    delete object.id;
    
    const fields = Object.keys(object);

    const values = fields.map(el=>{
        if(types[el] == 'arrayreal') return `ARRAY ${JSON.stringify(object[el])}`;
        if(types[el] != 'number' && types[el] != 'boolean') return object[el] && object[el].length > 0 ? "'" + object[el].replace(/'/g,"''") + "'" : "NULL";
        if(types[el] == 'boolean' && typeof object[el] === "boolean") return object[el] ? 'TRUE':'FALSE'; 
        return object[el];
    });

    const statement =  `UPDATE ${table} SET ( ${fields.join(', ')} ) = ( ${values.join(', ')}) WHERE id = ${id}`;
    return statement;
}