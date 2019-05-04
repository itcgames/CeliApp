import React from 'react';
import { View, Text, FlatList, ActivityIndicator,StyleSheet,TouchableHighlight,Image,Alert,TouchableOpacity } from "react-native";
import { ListItem, SearchBar } from 'react-native-elements';

import { NavigationEvents } from 'react-navigation';

import DatabaseManager from '../brokers/DatabaseManager';

export default class EntryList extends React.Component {
	

  state = {
    
    loading: false,
    data: [],
    error: null,
  }

  componentDidMount() {
    //this.makeRemoteRequest();
  }

  makeRemoteRequest() {
    //const url = `https://randomuser.me/api/?&results=20`;
    this.setState({ loading: true });

    DatabaseManager.getInstance().getAll(true, () => { alert("ERROR")}, (_, {rows: { _array }}) => this.setState(
      {
        data: _array,
        //error: res.error || null,
        loading: false,
      }));
  

    // fetch(url)
    //   .then(res => res.json())
    //   .then(res => {
    //     this.setState({
    //       data: res.results,
    //       error: res.error || null,
    //       loading: false,
    //     });
    //     this.arrayholder = res.results;
    //   })
    //   .catch(error => {
    //     this.setState({ error, loading: false });
    //   });
  }
  
    onPressTouchable(){
      Alert.alert("You selected the symptom")
    }

    onLongPressTouchable(){
      Alert.alert("You opened the severity chooser")
    }

  renderItem(item) {
    return (
        <TouchableHighlight onPress={this.onPressTouchable} onLongPress={this.onLongPressTouchable}> 
			<View>
			  <ListItem
				title={item.value}
				//subtitle={item.name.last}
				//leftAvatar={{ source: { uri: item.picture.thumbnail }}}
				
			  />
			  
			</View>
        </TouchableHighlight> 
    );
  } 

  renderSeparator() {
    return (
      <View
        style={{
			height: 15,
			width: 3,
			marginLeft: 35,
			backgroundColor: 'grey',
        }}
      />
    );
  };

  render() {
    return (
      <View>
        <NavigationEvents
          onWillFocus={(payload) => this.makeRemoteRequest()}
        />
        <FlatList
          data={this.state.data}
          renderItem={({item}) => this.renderItem(item)}
          keyExtractor={item => item.email}
          ItemSeparatorComponent={this.renderSeparator}
        />
      </View>
    );
  }
}
 
 var styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop:60
    },
    outerCircle: {
      borderRadius: 40,
      width: 80,
      height: 80,
      backgroundColor: 'red',
    },
  });


