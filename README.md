# MMM-pihole-stats

Pi-hole stats module for MagicMirror<sup>2</sup>

## Screenshots

With `config.showSources` enabled:

![Preview-Sources](docs/preview-showSources.png "Screen Shot (with Sources)")

Without `config.showSources` enabled:

![Preview](docs/preview.png "Screen Shot")

## Dependencies

- [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror)
- [Pi-hole](https://pi-hole.net)

## Installation

1. Clone this repo into `~/MagicMirror/modules` directory.<br>
  `git clone https://github.com/sheyabernstein/MMM-pihole-stats.git`
2. Run `npm install` in the cloned module directory
3. Obtain an API token from your PiHole installation by navigating to [http://pi.hole/admin/settings.php?tab=api](http://pi.hole/admin/settings.php?tab=api) and clicking `Show API token`
4. Configure your `~/MagicMirror/config/config.js`


Here is an example entry for `config.js`:

```
{
    module: "MMM-pihole-stats",
    position: "top_left", // Or any valid MagicMirror position.
    config: {
      apiToken: "0123456789abcdef"
      // See 'Configuration options' for more information.
    }
}
```

> Feb 27, 2024 update: This module now requires `npm install` when installing.

> Sep 27, 2020 update: Configuring the Pi-hole server to allow CORS is no longer needed.

## Configuration Options

| **Option**               | **Default**                    | **Description**                                                                                                                     |
|--------------------------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `apiURL`                 | `http://pi.hole/admin/api.php` | URL to Pi-hole admin, including HTTP protocol                                                                                       |
| `apiToken`               |                                | API Token from Pi-hole (required for `showSources`)                                                                                 |
| `showSources`            | `true`                         | Show request sources (clients)                                                                                                      |
| `sourcesCount`           | `10`                           | Number of returned entries for `showSources`                                                                                        |
| `showSourceHostnameOnly` | `true`                         | Only show hostname if applicable without showing IP address                                                                         |
| `updateInterval`         | `600000`                       | Time in ms to wait until updating                                                                                                   |
| `retryDelay`             | `30000`                        | Time in ms to wait before retry                                                                                                     |
| `floatingPoints`         | `2`                            | Format floating point numbers to decimal points, e.g. `2` to format to 5.55. Setting this to `0` will show unlimited decimal points |
