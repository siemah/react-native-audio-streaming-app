import React, { useEffect, useReducer, useRef } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

interface ReducerAction {
  type: "SET_AUDIO" | "SET_LOADING" | "SET_PLAY";
  payload: any;
}
interface AudioState {
  audio: any;
  volume: number;
  loading: boolean;
  shouldPlay: boolean;
}
function reducer(state: AudioState, { type, payload }: ReducerAction): AudioState {
  switch (type) {
    case "SET_AUDIO":
      return {
        ...state,
        loading: false,
        audio: payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: payload,
      };
    case "SET_PLAY":
      return {
        ...state,
        shouldPlay: payload,
      };
    default: return state;
  }
}
const initialState = {
  audio: null,
  volume: 0.5,
  loading: true,
  shouldPlay: false,
}
export default function AudioPlayer() {
  const audioSound = useRef<Audio.Sound>(new Audio.Sound());
  const [state, dispatch] = useReducer(reducer, initialState);
  // √ TODO: toggle the state of the audio either play/pause it
  const onToggleAudio = async () => {
    try {
      let res;
      if (state.shouldPlay) {
        res = await audioSound.current.pauseAsync();
      } else {
        res = await audioSound.current.replayAsync();
      }
      dispatch({
        type: "SET_PLAY",
        payload: !state.shouldPlay,
      });
    } catch (error) {
    }
  }
  // change audio volume
  const onChangeVolume = async (volume: number) => {
    try {
      await audioSound.current.setVolumeAsync(volume / 10);
    } catch (error) {
      console.log('[volume-error]: ', error);
    }
  }

  useEffect(() => {
    const loadAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true
        });
        const audio = await audioSound.current.loadAsync(
          {
            uri: 'https://str0.creacast.com/jowradio',
          },
          {
            shouldPlay: state.shouldPlay,
            volume: state.volume,
          }
        );
        dispatch({
          type: 'SET_AUDIO',
          payload: audio
        });
      } catch (error) {
        console.log('[[[error]]]')
        console.log(error)
      }
    }
    loadAudio();
    return () => {
      audioSound.current.unloadAsync && audioSound.current.unloadAsync();
    }
  }, [])

  return (
    <View>
      <Text>Audio player</Text>
      {
        state.loading && (
          <ActivityIndicator color="#f54" size='large' />
        )
      }
      <TouchableOpacity onPress={onToggleAudio} activeOpacity={.8} style={{ backgroundColor: '#7aa5e9', padding: 10 }}>
        <Text style={{ color: '#fff' }}>Play/Pause</Text>
      </TouchableOpacity>
      <Slider
        minimumValue={0}
        maximumValue={10}
        step={1}
        minimumTrackTintColor="#aeaeae"
        maximumTrackTintColor="#7aa5e9"
        style={{ width: 200, height: 40 }}
        value={initialState.volume * 10}
        onValueChange={onChangeVolume}
      />
    </View>
  )
}
