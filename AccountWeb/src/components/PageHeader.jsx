function PageHeader({ title, description }) {
    return (
        <div className="mb-3">
            <h2 className="mb-1">{title}</h2>
            (description ? <p className="text-muted mb-0">{description}</p>: null)
        </div>
    )
}

export default PageHeader;