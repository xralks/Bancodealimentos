// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login'; 
import Registro from './screens/Registro';
import Home from './screens/Home'; 
import MyPublication from './screens/MyPublication';
import Aceptadas from './screens/Aceptadas';
import UserProfile from './screens/UserProfile'
import Misdatos from './screens/Misdatos';
import AgregarAdmin from './screens/AgregarAdmin';
import Agregar from './screens/AgregarAdmin';
import Bienvenido from './screens/Bienvenido'
import PrimerPaso from './screens/PrimerPaso';
import Publicacion from './screens/Publicacion';
import PublicacionA from './screens/PublicacionA';
import HomeA from './screens/HomeA';
import AgregarInstitucion from './screens/AgregarInstitucion';
import AgregarLocatario from './screens/AgregarLocatario';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Bienvenido">
      <Stack.Screen name="Bienvenido" component={Bienvenido} options={{ title: ' ',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="Login" component={Login} options={{ title: ' ',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="PrimerPaso" component={PrimerPaso} options={{ title: ' ',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="Registro" component={Registro} options={{ title: 'Registro',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="Home" component={Home} options={{ title: 'Inicio',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",} }} />
        <Stack.Screen name="HomeA" component={HomeA} options={{ title: 'HomeA',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",} }} />
        <Stack.Screen name="Publicacion" component={Publicacion} options={{ title: 'Información',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="PublicacionA" component={PublicacionA} options={{ title: 'InformaciónA',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="Misdatos" component={Misdatos} options={{ title: 'Mis Datos',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }}/>
        <Stack.Screen name="MyPublication" component={MyPublication} options={{ title: 'Mis Publicaciones',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="Aceptadas" component={Aceptadas} options={{ title: 'Aceptadas',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="UserProfile" component={UserProfile} options={{ title: 'UserProfile',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="AgregarAdmin" component={AgregarAdmin} options={{ title: 'Avisos',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="AgregarInstitucion" component={AgregarInstitucion} options={{ title: 'Dar aviso',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />
        <Stack.Screen name="AgregarLocatario" component={AgregarLocatario} options={{ title: 'Donación',
                  headerTintColor:"white",
                  headerTitleAlign:"center",
                  headerStyle:{backgroundColor:"#77d353",}
         }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
