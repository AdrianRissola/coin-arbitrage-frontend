const RowFilter = (props)=> {
    const filtersComponents = props.filters

    return(
        <div className="row">
            {
                filtersComponents.map(filterComponent => {
                    return (
                        <div key= {filterComponent.type.name} className="input-group mb-3" style={{width: '250px', marginLeft:'2rem'}}>
                            { filterComponent }
                        </div>
                    )
                })
            }
        </div>
    )
}

export default RowFilter