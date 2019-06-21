import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ActionButton from 'react-native-action-button';
import { Icon } from 'expo';
import LanguageManager from '../manager/LanguageManager';

export default class MenuButton extends React.Component {
  constructor(props) {
    super(props);
  }
    render() {
        return (
            <View style={styles.container}>
                <ActionButton buttonColor="rgba(231,76,60,1)">
                  <ActionButton.Item buttonColor='#9b59b6' title={LanguageManager.getInstance().getText("ADD_EMOTION")} onPress={() => this.props.navigation.navigate('AddEmote')}>
                    <Icon.Ionicons name="md-happy" style={styles.actionButtonIcon} />
                  </ActionButton.Item>
                  <ActionButton.Item buttonColor='#3498db' title={LanguageManager.getInstance().getText("ADD_MEAL")} onPress={() => this.props.navigation.navigate('AddMeal')}>
                    <Icon.Ionicons name="md-restaurant" style={styles.actionButtonIcon} />
                  </ActionButton.Item>
                  <ActionButton.Item buttonColor='#1abc9c' title={LanguageManager.getInstance().getText("ADD_SYMPTOM")} onPress={() => this.props.navigation.navigate('AddSymptom')}>
                    <Icon.Ionicons name="md-medkit" style={styles.actionButtonIcon} />
                  </ActionButton.Item>
                </ActionButton>                
            </View>
        );
    }  
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    actionButtonIcon: {
      fontSize: 35,
      color: 'white',
    }
  });