import React, {useEffect, useState} from 'react';
import {NativeBaseProvider, Text, Box, ScrollView} from 'native-base';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
} from 'react-native';
import {API, graphqlOperation} from 'aws-amplify';
import {createTodo} from './src/graphql/mutations';
import {listTodos} from './src/graphql/queries';
import {
  withAuthenticator,
  useAuthenticator,
} from '@aws-amplify/ui-react-native';

// retrieves only the current value of 'user' from 'useAuthenticator'
const userSelector = context => [context.user];

const SignOutButton = () => {
  const {user, signOut} = useAuthenticator(userSelector);
  return (
    <Pressable onPress={signOut} style={styles.buttonContainer}>
      <Text style={styles.buttonText}>
        Hello, {user?.username}! Click here to sign out!
      </Text>
    </Pressable>
  );
};

const initialFormState = {name: '', description: ''};

const App = () => {
  const [formState, setFormState] = useState(initialFormState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodo();
  }, []);

  function setInput(key, value) {
    setFormState({...formState, [key]: value});
  }

  async function fetchTodo() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = {...formState};
      setTodos([...todos, todo]);
      setFormState(initialFormState);
      await API.graphql(graphqlOperation(createTodo, {input: todo}));
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  return (
    <NativeBaseProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <SignOutButton />
          <Box flex={1} bg="#fff" alignItems="center" justifyContent="center">
            <Text>Example of NativeBase with React Native</Text>
          </Box>
          <TextInput
            onChangeText={value => setInput('name', value)}
            style={styles.input}
            value={formState.name}
            placeholder="Name"
          />
          <TextInput
            onChangeText={value => setInput('description', value)}
            style={styles.input}
            value={formState.description}
            placeholder="Description"
          />
          <Pressable onPress={addTodo} style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Create todo</Text>
          </Pressable>
          <ScrollView showsVerticalScrollIndicator={false} marginTop={10}>
            {todos.map((todo, index) => (
              <View key={todo.id ? todo.id : index} style={styles.todo}>
                <Text style={styles.todoName}>{todo.name}</Text>
                <Text style={styles.todoDescription}>{todo.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </NativeBaseProvider>
  );
};

export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {width: 400, flex: 1, padding: 20, alignSelf: 'center'},
  todo: {marginBottom: 15},
  input: {backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18},
  todoName: {fontSize: 20, fontWeight: 'bold'},
  buttonContainer: {
    alignSelf: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 8,
  },
  buttonText: {color: 'white', padding: 16, fontSize: 18},
});
