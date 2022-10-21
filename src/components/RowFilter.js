const RowFilter = (props)=> {
    const filters = props.filters

    return(
        <div className="row">
            {
                filters.map(filter => {
                    return (
                        <div className="input-group mb-3" style={{width: '250px', marginLeft:'2rem'}}>
                            { filter }
                        </div>
                    )
                })
            }
        </div>
    )
}

export default RowFilter