const RowFilter = (props)=> {
    const filtersComponents = props.filters

    return(
        <div className="row" style={{display:"flex", justifyContent:"center"}}>
            {
                filtersComponents.map(filterComponent => {
                    return (
                        <div key= {filterComponent.type.name} className="input-group mb-3" 
                            style={{ 
                                display:"flex",
                                width: filterComponent.props.styleWidth || '210px',
                                marginRight: filterComponent.props.marginRight
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