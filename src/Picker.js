import React, { Component } from 'react';

class Picker extends Component {
    constructor(props) {
        super(props);
        this.spells = props.spells;
        this.state = {};
        this.spellList = [];
    }

    // Retrieve infos from cards
    getSpellData = (data, checked) => {
        if(!checked) {
            // Add spell to list
            this.spellList.push(data);
        } else {
            const sl = this.spellList;
            if(sl.length > 0) {
                for(let i = sl.length-1; i >= 0; i--) {
                    if(sl[i][0] === data[0]) {
                        this.spellList.splice(i, 1)
                        break;
                    }
                }
            }
        }
        console.log(this.spellList)
    }

    // Send data to parent (App)
    sendSpellList = () => {
        this.props.callbackFromPicker(this.spellList);
    }

    render() {
        const listItems = this.spells.map((spell, index) => (
            <Spell 
                spellData={spell}
                key={index} 
                spellId={index} 
                state={this.state}
                callbackFromSpell={this.getSpellData}
                />
            ))

        return(
            <div>
                <nav className="Navbar">
                    <button 
                        className="Btn" 
                        onClick={this.sendSpellList}>Create Deck</button>
                    </nav>
                <ul className="Picker-list">
                    {listItems}
                </ul>
            </div>
        )
    }
}

class Spell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: false
        };
        this.spellId = props.spellId;
        this.spellData = props.spellData;
    }

    toggleSpell = () => { 
        // Send data to parent via callback
        this.setState({isChecked: !this.state.isChecked},
            this.props.callbackFromSpell(
                [this.spellId, this.spellData],
                this.state.isChecked
            )
        );

    }

    render() {
        console.log(this.state.isChecked);
        return(
            <li className="Spell">
                <input 
                    id={this.spellId}
                    type="checkbox" 
                    onChange={this.toggleSpell} 
                    checked={this.state.isChecked}/>
                <label htmlFor={this.spellId}>{this.spellData.title}</label>
            </li>
        )
    }
}

export default Picker;