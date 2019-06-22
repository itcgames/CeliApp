
import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import SymptomIconButton from './SymptomIconButton';
import DatabaseManager from '../../manager/DatabaseManager';


const CLUSTER_SIZE = 4;

export default class SymptomGroup extends React.Component{

    constructor(props) {
       super(props);
       this.severityChooserHandler = this.severityChooserHandler.bind(this);
       this.symptomSelected = this.symptomSelected.bind(this)
       this.symptomDeselected = this.symptomDeselected.bind(this)
       this.state = {
           canOpenSeverityChooser: true,
           symptomAndSeverityList: [],
           oneVisible: 0,
           twoVisible: 0,
           threeVisible: 0,
           fourVisible: 0,
           fiveVisible: 0,
           sixVisible: 0,
           sevenVisible: 0,
           eigthVisible: 0,
           backgroundVisible: -1,
           symptoms: null,
           loading: true,
           showMore: this.props.showMore == null ? false : this.props.showMore,
       } 
    }

    refreshSymptoms() {
        this.setState({ loading: true });
      
        DatabaseManager.getInstance().fetchSymptoms(
            (_, error) => {alert(error)}, 
            (_, {rows: { _array }}) => this.setState(
            {
              symptoms: _array,
              //error: res.error || null,
              loading: false,
            })
        );
    }

    deleteSymptoms(){
        this.setState({
            canOpenSeverityChooser: true, 
            symptomAndSeverityList: []
        })
        //reset every symptom 
        this._sympIc1.resetSymptom();
        this._sympIc2.resetSymptom();
        this._sympIc3.resetSymptom();
        this._sympIc4.resetSymptom();
        this._sympIc5.resetSymptom();
        this._sympIc6.resetSymptom();
        this._sympIc7.resetSymptom();
    }
    

    severityChooserHandler(setActive, symptomID){
        if(setActive){
            this.setState({
                canOpenSeverityChooser: true,
            });
        }else{
            this.setState({
                canOpenSeverityChooser: false,
            });
        }

    }


    symptomSelected(symptomID, severity){ //severity: 1==yellow, 2==orange, 3==red
        let tmpArray = this.state.symptomAndSeverityList;
        tmpArray.push([symptomID,severity])
        var arrayLength = tmpArray.length;
        this.props.onSelectedSymptomIDsChanged(tmpArray)
    }


    //Deletion of symptoms doesnt work property.
    //TODO!! - dont know why, but sometimes it deletes more than neccessary, sometimes less....
    symptomDeselected(symptomID, severity){
        let tmpArray = this.state.symptomAndSeverityList;
        var arrayLength = tmpArray.length;
        var toFind = [symptomID,severity];
        for(var i = 0; i < arrayLength; i++){
            let toSearch = tmpArray[i, 0];
            if(toSearch.toString().localeCompare(toFind.toString())){
                tmpArray.splice(i,1);
            }
        }
        this.props.onSelectedSymptomIDsChanged(tmpArray)
    }

    groupSymptoms(from, size) {
        let cluster = [];
        let symptomPos = 0;

        for (k = from; k < (from + size) && k < this.state.symptoms.length; k++) {
            symptomPos = (k % CLUSTER_SIZE);

            if (symptomPos == 0) {
                cluster.push(<SymptomIconButton type={1} key={this.state.symptoms[k].id} symptomID={this.state.symptoms[k].id} symptomName={this.state.symptoms[k].name} symptomIcon={this.state.symptoms[k].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled={this.severityChooserHandler} canOpenSeverity={this.state.canOpenSeverityChooser} onSymptomSelected={this.symptomSelected} onSymptomDeselected={this.symptomDeselected}/>);
            } else if (symptomPos == 1 || symptomPos == 2) {
                cluster.push(<SymptomIconButton type={2} key={this.state.symptoms[k].id} symptomID={this.state.symptoms[k].id} symptomName={this.state.symptoms[k].name} symptomIcon={this.state.symptoms[k].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled={this.severityChooserHandler} canOpenSeverity={this.state.canOpenSeverityChooser} onSymptomSelected={this.symptomSelected} onSymptomDeselected={this.symptomDeselected}/>);
            } else {
                cluster.push(<SymptomIconButton type={3} key={this.state.symptoms[k].id} symptomID={this.state.symptoms[k].id} symptomName={this.state.symptoms[k].name} symptomIcon={this.state.symptoms[k].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled={this.severityChooserHandler} canOpenSeverity={this.state.canOpenSeverityChooser} onSymptomSelected={this.symptomSelected} onSymptomDeselected={this.symptomDeselected}/>);
            }
        }

        if (k < (from + size) &&  k >= this.state.symptoms.length) {
            while (++k < (from + size)) {
                cluster.push(<SymptomIconButton key={k} opacity={0}/>);
            }

            cluster.push(<SymptomIconButton type={5} key={0} symptomID={0} symptomName="ADD_NEW_SYMPTOM" symptomIcon={require('../../assets/images/SymptomTracker/addSymptom.png')} onSeverityChooserHandled = {this.severityChooserHandler} canOpenSeverity={this.state.canOpenSeverityChooser} onSymptomSelected={this.symptomSelected} onSymptomDeselected={this.symptomDeselected} navigation={this.props.navigation}/>);
        }

        return cluster;
    }

    renderMoreSymptoms() {
        let moreList = [];

        for (i = 0; i < this.state.symptoms.length; i += CLUSTER_SIZE) {
            moreList.push(<View key={i} style={styles.groupContainer}>{this.groupSymptoms(i, CLUSTER_SIZE)}</View>)
        }

        if (this.state.symptoms.length % CLUSTER_SIZE == 0) {
            moreList.push(<View key={this.state.symptoms.length} style={styles.groupContainer}>{this.groupSymptoms(this.state.symptoms.length, CLUSTER_SIZE)}</View>)
        }

        return moreList
    }

    render() {
        if (this.state.loading) {
            return (
                <View>
                    <NavigationEvents onDidFocus={() => this.refreshSymptoms()}/>
                    <ActivityIndicator size='large' color='lightblue' />
                </View>
            );
        } 
        else if (!this.state.showMore) {
            return (
                <View>
                    <NavigationEvents onDidFocus={() => this.refreshSymptoms()}/>
                    <View style={{zIndex: 0, top: 40}}>
                        <View style={styles.groupContainer}>
                            <SymptomIconButton ref={component => this._sympIc1 = component} type = {1} symptomID={this.state.symptoms[0].id} symptomName={this.state.symptoms[0].name} symptomIcon={this.state.symptoms[0].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled = {this.severityChooserHandler} canOpenSeverity = {this.state.canOpenSeverityChooser} onSymptomSelected = {this.symptomSelected} onSymptomDeselected = {this.symptomDeselected}/>
                            <SymptomIconButton ref={component => this._sympIc2 = component} type = {2} symptomID={this.state.symptoms[1].id} symptomName={this.state.symptoms[1].name} symptomIcon={this.state.symptoms[1].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled = {this.severityChooserHandler} canOpenSeverity = {this.state.canOpenSeverityChooser} onSymptomSelected = {this.symptomSelected} onSymptomDeselected = {this.symptomDeselected}/>
                            <SymptomIconButton ref={component => this._sympIc3 = component} type = {2} symptomID={this.state.symptoms[2].id} symptomName={this.state.symptoms[2].name} symptomIcon={this.state.symptoms[2].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled = {this.severityChooserHandler} canOpenSeverity = {this.state.canOpenSeverityChooser} onSymptomSelected = {this.symptomSelected} onSymptomDeselected = {this.symptomDeselected}/>
                            <SymptomIconButton ref={component => this._sympIc4 = component} type = {3} symptomID={this.state.symptoms[3].id} symptomName={this.state.symptoms[3].name} symptomIcon={this.state.symptoms[3].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled = {this.severityChooserHandler} canOpenSeverity = {this.state.canOpenSeverityChooser} onSymptomSelected = {this.symptomSelected} onSymptomDeselected = {this.symptomDeselected}/>             
                        </View>
                        <View style={styles.groupContainer}>
                            <SymptomIconButton ref={component => this._sympIc5 = component} type = {1} symptomID={this.state.symptoms[4].id} symptomName={this.state.symptoms[4].name} symptomIcon={this.state.symptoms[4].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled = {this.severityChooserHandler} canOpenSeverity = {this.state.canOpenSeverityChooser} onSymptomSelected = {this.symptomSelected} onSymptomDeselected = {this.symptomDeselected}/>
                            <SymptomIconButton ref={component => this._sympIc6 = component} type = {2} symptomID={this.state.symptoms[5].id} symptomName={this.state.symptoms[5].name} symptomIcon={this.state.symptoms[5].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled = {this.severityChooserHandler} canOpenSeverity = {this.state.canOpenSeverityChooser} onSymptomSelected = {this.symptomSelected} onSymptomDeselected = {this.symptomDeselected}/>
                            <SymptomIconButton ref={component => this._sympIc7 = component} type = {2} symptomID={this.state.symptoms[6].id} symptomName={this.state.symptoms[6].name} symptomIcon={this.state.symptoms[6].icon} onSymptomDeleted={() => this.refreshSymptoms()} onSeverityChooserHandled = {this.severityChooserHandler} canOpenSeverity = {this.state.canOpenSeverityChooser} onSymptomSelected = {this.symptomSelected} onSymptomDeselected = {this.symptomDeselected}/>
                            <SymptomIconButton ref={component => this._moreSymp = component} type = {4} symptomID={0} symptomName="MORE_SYMPTOMS" symptomIcon={require('../../assets/images/SymptomTracker/moreSymptoms.png')} onSeverityChooserHandled = {this.severityChooserHandler} canOpenSeverity = {this.state.canOpenSeverityChooser} onSymptomSelected = {this.symptomSelected} onSymptomDeselected = {this.symptomDeselected} navigation={this.props.navigation}/>
                        </View>
                    </View>
                </View>
            )
        } else {
            return (
                <View>
                    <NavigationEvents onDidFocus={() => this.refreshSymptoms()}/>
                    <View style={{zIndex: 0, top: 40}}>
                        {this.renderMoreSymptoms()}
                    </View>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    groupContainer: {
        height: 130,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start'
    },
});