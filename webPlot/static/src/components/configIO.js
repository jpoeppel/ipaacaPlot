import React, { PureComponent } from 'react';

export class ConfigLoader extends PureComponent
{
    constructor(props)
    {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e)
    {
        console.log(e.target.files);

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (file) => {
            console.log("loaded: ", file.target.result);
            let newConfig = JSON.parse(file.target.result);
            this.props.configLoaded(newConfig);
        };

        reader.readAsText(e.target.files[0])
    }

    render ()
    {
        return <div>
            <input type="file" onChange={this.handleChange} accept=".json"/>
        </div>;
    }
}


export class ConfigSaver extends PureComponent {

    constructor(props)
    {
        super(props);
        this.onSave = this.onSave.bind(this);
    }

    onSave() {

        let layoutstring = JSON.stringify(this.props.config, null, 2);
        var blob = new Blob([layoutstring], {type: "application/json"});
        var url  = URL.createObjectURL(blob);
        var downloadAnchorNode = document.getElementById('downloadAnchorElem');
        downloadAnchorNode.setAttribute("href", url);
        downloadAnchorNode.setAttribute("download", "layout.json");
        downloadAnchorNode.click();
    }

    render() {

        return <div>
                <button onClick={this.onSave}>Save Config</button>
                <a id="downloadAnchorElem" style={{"display":"none"}}></a>
            </div>
    }
}