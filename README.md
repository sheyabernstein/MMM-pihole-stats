# MMM-pihole-stats
Pi-Hole stats for MagicMirror<sup>2</sup>

## Dependencies
  * An installation of [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror)

## Installation
 1. Clone this repo into `~/MagicMirror/modules` directory.
 2. Configure your `~/MagicMirror/config/config.js`:
 
     ```
     {
         module: 'MMM-pihole-stats',
         position: 'top_left', // Or any valid MagicMirror position.
         config: {
             // See 'Configuration options' for more information.
         }
     }
     ```
     
  3. Configure Pi-Hole server to allow CORS:
  *edit ```/etc/lighttpd/external.conf``` and add the following:
  ```
  $HTTP["url"] =~ "^/admin/api.php" {
      setenv.add-environment = (
    		"SERVER_NAME" => "{ip address of hostname, e.g. 127.0.0.1}"
  	)
  }
  ```
  * save the file and restart lighttpd with ```sudo systemctl restart lighttpd```

## Configuration Options
| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `showSources` | `true` | Show request sources |
| `showSourceHostnameOnly` | `true` | Only show hostname if applicable without showing IP address |
| `updateInterval` | `600000` | Time in ms to wait until updating |
| `retryDelay` | `30000` | Time in ms to wait before retry |
