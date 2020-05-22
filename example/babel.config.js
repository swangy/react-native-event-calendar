module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module-resolver',
      {
        alias: {
          '@agendapro/react-native-events-calendar': '../src/EventCalendar',
        },
      },
    ],
  ],
};
