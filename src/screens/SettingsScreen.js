import React from 'react';
import { View, Button, Picker, TextInput } from 'react-native';
import Dialog from "react-native-dialog";
import { HeaderBackButton } from 'react-navigation'
// import TextInputSingleLine from '../components/TextInputSingleLine';
import HorizontalLineWithText from '../components/HorizontalLineWithText';
import LanguageManager from '../manager/LanguageManager';
import DatabaseManager from '../manager/DatabaseManager';
import GlutonManager from '../manager/GlutonManager';

export default class SettingsScreen extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: LanguageManager.getInstance().getText("SETTINGS"),
    headerLeft: <HeaderBackButton onPress={() => navigation.state.params.onCancelPressed()}/>,
    headerRight: <View style={{paddingRight: 10}}><Button title={LanguageManager.getInstance().getText("SAVE")} onPress={() => navigation.state.params.onOkPressed(true)}/></View>
  });
  
  state = {
    modified: true, // true for DEBUG now
    cancelSaveDialogVisible: false,
    language: LanguageManager.getInstance().getLanguage(),
    nickname: GlutonManager.getInstance().getBuddy(),
  }

  componentDidMount() {        
    this.props.navigation.setParams({ 
        onOkPressed: this.saveCurrentData.bind(this) ,
        onCancelPressed: this.handleCancelButton.bind(this) ,
    })
  }

  saveCurrentData(goHome) {
    LanguageManager.getInstance().setLanguage(this.state.language);
    GlutonManager.getInstance().setBuddy(this.state.nickname);

    DatabaseManager.getInstance().saveSettings('language', LanguageManager.getInstance().getLanguage(), (error) => {alert(error)}, null);
    DatabaseManager.getInstance().saveSettings('nickname', GlutonManager.getInstance().getBuddy(), (error) => {alert(error)}, null);
    
    if (goHome) {
        setTimeout(() => this.props.navigation.goBack(), 100);
    }
  }

  handleCancelButton() {
    if (this.state.modified == true) {
        this.showBackDiscardDialog()
    } else {
        this.props.navigation.goBack()
    }
  }

  showBackDiscardDialog() {
    this.setState({ cancelSaveDialogVisible: true });
  };

  handleBack() {
    this.setState({ cancelSaveDialogVisible: false });
  };

  handleDiscard() {
    this.setState({ cancelSaveDialogVisible: false });
    this.props.navigation.goBack()
  };

  render() {
    return (
      <View>
        <HorizontalLineWithText text={LanguageManager.getInstance().getText("LANGUAGE")}/>
        <Picker
          selectedValue={this.state.language}
          style={{height: 50, width: '50%'}}
          onValueChange={(itemValue, itemIndex) =>
            this.setState({language: itemValue})
          }>
          {Object.values(LanguageManager.getInstance().getAllLanguages()).map((lang) => (
            <Picker.Item key={lang.name} label={lang.name} value={lang.name} />
          ))}
        </Picker>
        <HorizontalLineWithText text={LanguageManager.getInstance().getText("NICKNAME")}/>
        {/* <TextInputSingleLine defaultValue={this.state.nickname} onChangText={(name) => this.setState({nickname: name})} style={{Top: 10}}/> */}
        <TextInput onChangeText={(text) => this.setState({nickname: text})} value={this.state.nickname} />

        <View>
            <Dialog.Container visible={this.state.cancelSaveDialogVisible}>
                <Dialog.Title>{LanguageManager.getInstance().getText("DISCARD")}</Dialog.Title>
                <Dialog.Description>
                {LanguageManager.getInstance().getText("DO_YOU_WANT_TO_DISCARD")}
                </Dialog.Description>
                <Dialog.Button label={LanguageManager.getInstance().getText("BACK")} onPress={() => this.handleBack()} />
                <Dialog.Button label={LanguageManager.getInstance().getText("DISCARD")} onPress={() => this.handleDiscard()} />
            </Dialog.Container>
        </View>
      </View>
    );
  }
}