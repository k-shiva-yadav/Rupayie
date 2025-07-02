# To get android folder 
```
npx expo prebuild
```

# To get finger print (Java JDK Version should be more than 17)
```
CD .\android\
./gradlew signingReport
```
# To build
```
npx eas --version
npx eas update:configure
npx eas update --branch production --message "Message"
npx eas build -p android --profile preview
```
