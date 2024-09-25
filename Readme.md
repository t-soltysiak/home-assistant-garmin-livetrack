# Garmin-livetrack-to-json

FORKED FROM: https://github.com/Novex/garmin-livetrack-obs

Automatically search for the Garmin Livetrack email in your inbox and output fields from the API to JSON http response e. g. to use in Home Assistant sensors.


![screenshot](https://github.com/t-soltysiak/garmin-livetrack-to-json/assets/68973012/a7cfd6b5-2ceb-4e87-9558-a58f96362739)



## Usage
1. Clone/[download] this repo
2. Copy the `config.template.js` file to `config.js` and fill in your email address and password
3. run `npm install` in a command prompt to get the dependencies
4. run `npm start` in a command prompt to start searching for a Garmin email and output json data.
5. Access localhost:8200 to see live track activity respond

TIP: for Home Assistant sensors, use can use some rest templates like this:

1) Run as service:
create file /etc/systemd/system/garmin.service:
```
[Unit]
Description=Garmin Live Track monitor
After=multi-user.target
[Service]
Type=simple
Restart=always
WorkingDirectory=/home/homeassistant/garmin
ExecStart=/usr/bin/npm start

[Install]
WantedBy=multi-user.target
```
run
```
systemctl enable --now garmin
```

2) Edit configuration.yaml in HA - remember to update secretPath protection in resource url:
```
rest:
  - resource: http://127.0.0.1:8200/b50ff165-effa-45d6-b24b-6ff06a03e846
    scan_interval: 60
    timeout: 30
    sensor:
      - name: Garmin LiveTrack URL
        value_template: "{% if value_json is defined and 'sessionUrl' in value_json %}{{ value_json.sessionUrl }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack dateTime
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'dateTime' in value_json.trackPoints[-1] %}{{ value_json.trackPoints[-1].dateTime | as_timestamp | timestamp_custom('%d-%m-%Y %H:%M') }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack altitude
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'altitude' in value_json.trackPoints[-1] %}{{ (value_json.trackPoints[-1].altitude) | round(0) }}{% else %}Niedostępne{% endif %}"
        unit_of_measurement: "m n.p.m."
      - name: Garmin LiveTrack speed
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'speed' in value_json.trackPoints[-1] %}{{ ((value_json.trackPoints[-1].speed) | float * 3.6) | round(1) }}{% else %}Niedostępne{% endif %}"
        unit_of_measurement: "km/h"
      - name: Garmin LiveTrack averange speed
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'durationSecs' in value_json.trackPoints[-1].fitnessPointData and 'distanceMeters' in value_json.trackPoints[-1].fitnessPointData %}{{ (((value_json.trackPoints[-1].fitnessPointData.distanceMeters / 1000) / (value_json.trackPoints[-1].fitnessPointData.durationSecs / 60)) * 60) | round(2) }}{% else %}Niedostępne{% endif %}"
        unit_of_measurement: "km/h"
      - name: Garmin LiveTrack position lat
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'lat' in value_json.trackPoints[-1].position %}{{ value_json.trackPoints[-1].position.lat }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack position lon
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'lon' in value_json.trackPoints[-1].position %}{{ value_json.trackPoints[-1].position.lon }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack position address
        value_template: "{% if value_json is defined and 'sessionUrl' in value_json %}{{ value_json.positionAddress }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack created time
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'activityCreatedTime' in value_json.trackPoints[-1].fitnessPointData %}{{ value_json.trackPoints[-1].fitnessPointData.activityCreatedTime | as_timestamp | timestamp_custom('%d-%m-%Y %H:%M') }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack finished
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'eventTypes' in value_json.trackPoints[-1].fitnessPointData %}{{ ('zakończona' if 'END' in value_json.trackPoints[-1].fitnessPointData.eventTypes else 'TRWAJĄCA!') }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack activity type
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'activityType' in value_json.trackPoints[-1].fitnessPointData %}{{ value_json.trackPoints[-1].fitnessPointData.activityType | lower }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack duration
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'durationSecs' in value_json.trackPoints[-1].fitnessPointData %}{{ value_json.trackPoints[-1].fitnessPointData.durationSecs | timestamp_custom('%H:%M:%S', false) }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack total duration
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'totalDurationSecs' in value_json.trackPoints[-1].fitnessPointData %}{{ value_json.trackPoints[-1].fitnessPointData.totalDurationSecs | timestamp_custom('%H:%M:%S', false) }}{% else %}Niedostępne{% endif %}"
      - name: Garmin LiveTrack total distance
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'totalDistanceMeters' in value_json.trackPoints[-1].fitnessPointData %}{{ ((value_json.trackPoints[-1].fitnessPointData.totalDistanceMeters | int(0)) / 1000) | round(2) }}{% else %}Niedostępne{% endif %}"
        unit_of_measurement: "km"
      - name: Garmin LiveTrack cadence
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'cadenceCyclesPerMin' in value_json.trackPoints[-1].fitnessPointData %}{{ value_json.trackPoints[-1].fitnessPointData.cadenceCyclesPerMin }}{% else %}Niedostępne{% endif %}"
        unit_of_measurement: "rpm"
      - name: Garmin LiveTrack power watts
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'powerWatts' in value_json.trackPoints[-1].fitnessPointData %}{{ value_json.trackPoints[-1].fitnessPointData.powerWatts }}{% else %}Niedostępne{% endif %}"
        unit_of_measurement: "W"
      - name: Garmin LiveTrack heart beats
        value_template: "{% if value_json is defined and 'trackPoints' in value_json and (value_json.trackPoints | length) > 0 and 'fitnessPointData' in value_json.trackPoints[-1] and 'heartRateBeatsPerMin' in value_json.trackPoints[-1].fitnessPointData %}{{ value_json.trackPoints[-1].fitnessPointData.heartRateBeatsPerMin }}{% else %}Niedostępne{% endif %}"
        unit_of_measurement: "bpm"

```

3) Install by HACS this plugin https://github.com/iantrich/config-template-card for custom iframe (preview with map etc.) cause default webpage card does not support passing dynamic urls

4) Create helper type number and name "garmin_notify" in Settings -> Helpers - it will be used for notifications with current position address every X kilometers (for example automation)

5) Edit dashboard Yaml:
```
type: vertical-stack
cards:
  - type: conditional
    conditions:
      - entity: sensor.garmin_livetrack_activity_type
        state: cycling
      - condition: state
        entity: sensor.garmin_livetrack_url
        state_not: Niedostępne
    card:
      type: entities
      title: 'LiveTrack: Tomasz'
      entities:
        - entity: sensor.garmin_livetrack_finished
          name: Status aktywności
          icon: mdi:progress-check
        - entity: sensor.garmin_livetrack_activity_type
          name: Rodzaj aktywności
          icon: mdi:bike-fast
        - entity: sensor.garmin_livetrack_created_time
          name: Czas rozpoczęcia
          icon: mdi:av-timer
        - entity: sensor.garmin_livetrack_duration
          name: Czas jazdy
          icon: mdi:av-timer
        - entity: sensor.garmin_livetrack_total_duration
          name: Czas trwania
          icon: mdi:av-timer
        - entity: sensor.garmin_livetrack_position_address
          name: Lokalizacja
          icon: mdi:map-marker
        - entity: sensor.garmin_livetrack_total_distance
          name: Dystans
          icon: mdi:arrow-up-down-bold
        - entity: sensor.garmin_livetrack_altitude
          name: Wysokość
          icon: mdi:altimeter
        - entity: sensor.garmin_livetrack_averange_speed
          name: Średnia prędkość
          icon: mdi:speedometer
        - entity: sensor.garmin_livetrack_speed
          name: Prędkość
          icon: mdi:speedometer
        - entity: sensor.garmin_livetrack_cadence
          name: Kadencja
          icon: mdi:reload
        - entity: sensor.garmin_livetrack_power_watts
          name: Moc
          icon: mdi:shoe-cleat
        - entity: sensor.garmin_livetrack_heart_beats
          name: Tętno
          icon: mdi:heart-multiple
        - entity: sensor.garmin_livetrack_datetime
          name: Czas aktualizacji
          icon: mdi:av-timer
        - entity: input_number.garmin_notify
          name: Co ile km powiadom
          icon: mdi:map-marker-alert
  - type: conditional
    conditions:
      - entity: sensor.garmin_livetrack_activity_type
        state: cycling
      - condition: state
        entity: sensor.garmin_livetrack_url
        state_not: Niedostępne
    card:
      type: custom:config-template-card
      variables:
        URL: states['sensor.garmin_livetrack_url'].state
      entities:
        - sensor.garmin_livetrack_url
      card:
        type: iframe
        url: ${URL}
        aspect_ratio: 100%
```

6) Create automatizations for notification when:

a) user start riding:

```
alias: Powiadom gdy Tomasz zacznie jeździć rowerem
description: ""
trigger:
  - platform: state
    entity_id:
      - sensor.garmin_livetrack_finished
    to: TRWAJĄCA!
    for:
      hours: 0
      minutes: 0
      seconds: 0
condition:
  - condition: state
    entity_id: sensor.garmin_livetrack_activity_type
    state: cycling
action:
  - service: script.tts_chromecast
    data:
      message: Tomasz zaczął jeździć rowerem.
mode: single
```

b) user end rides:

```
alias: Powiadom gdy Tomasz zakończy jazdę rowerem
description: ""
trigger:
  - platform: state
    entity_id:
      - sensor.garmin_livetrack_finished
    to: zakończona
    from: TRWAJĄCA!
condition:
  - condition: state
    entity_id: sensor.garmin_livetrack_activity_type
    state: cycling
action:
  - service: script.tts_chromecast
    data:
      message: Tomasz zakończył jazdę rowerem.
mode: single
```

c) or user rides executed every X kilometers on some chromecast speakers :-)

```
alias: Powiadom gdy Tomasz jeździ rowerem
description: ""
trigger:
  - platform: template
    value_template: >-
      {{ states('sensor.garmin_livetrack_total_distance') | int(0) %
      states('input_number.garmin_notify') | int(0) == 0 and
      (states('sensor.garmin_livetrack_total_distance') | int(0)) > 0 }}
condition:
  - condition: state
    entity_id: sensor.garmin_livetrack_finished
    state: TRWAJĄCA!
  - condition: numeric_state
    entity_id: sensor.garmin_livetrack_distance
    above: 1
action:
  - service: script.tts_chromecast
    data:
      message: >-
        Tomasz przejechał rowerem {{
        states('sensor.garmin_livetrack_total_distance') | int }} kilometrów ze
        średnią prędkością około {{
        states('sensor.garmin_livetrack_averange_speed') | int }} kilometrów na
        godzinę. Jego aktualna lokalizacja to {{
        states('sensor.garmin_livetrack_position_address') }}.
mode: single
```

7) You can also add hide activity button visible on screenshot by creating boolean helper and conditional visibility of dashboard card (optional)

Above HA Conditional Card https://www.home-assistant.io/dashboards/conditional/ automatically will show when LiveTrack status is on going or recently finished.
If not data is fetched from Garmin servers (see logs e. g. with systemctl status garmin -n 50) card will be not visible to not take up space on the dashboards.
