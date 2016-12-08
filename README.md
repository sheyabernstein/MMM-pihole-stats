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
         position: 'top_left',
         config: {
             // See 'Configuration options' for more information.
         }
     }
     ```
 3. Open `/etc/lighttpd/lighttpd.conf` with your favourite editor and add `"Access-Control-Allow-Origin" => "*",` to `setenv.add-response-header` - probably at around line 50 in the file.

## Configuration Options
| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `apiUrl` | `http://pi-hole/admin/api.php` | Absolute URL to the Pi-Hole admin API |
| `showSources` | `true` | Show request sources |
| `showSourceHostnameOnly` | `true` | Only show hostname if applicable without showing IP address |
| `updateInterval` | `600000` | Time in ms to wait until updating |
| `retryDelay` | `2500` | Time in ms to wait before retry |