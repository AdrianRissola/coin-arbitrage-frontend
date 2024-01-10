const RowFilter = (props)=> {
    const filtersComponents = props.filters

    return(
        <div className="row" style={{display:"flex", justifyContent:"center"}}>
            {
                filtersComponents.map(filterComponent => {
                    return (
                        <div key= {filterComponent.type.name} className="input-group mb-3" 
                            style={{
                                width: filterComponent.props.styleWidth || '200px'
                            }}
                        >
                            { filterComponent }
                        </div>
                    )
                })
            }
        </div>
    )
}

export default RowFilter