# MMM-pihole-stats

Pi-hole stats module for MagicMirror².

> :warning: **Pi-Hole v6 Breaking Changes**: Pi-hole v6 has revamped its API. The module now uses a REST-based authentication flow and updated endpoints to fetch accurate statistics from your Pi-hole instance. Please update your configuration accordingly. Thanks [@ChrisF1976](https://github.com/ChrisF1976).

## Screenshots

With `config.showSources` enabled:

![Preview-Sources](docs/preview-showSources.png "Screen Shot (with Sources)")

Without `config.showSources` enabled:

![Preview](docs/preview.png "Screen Shot")

## Dependencies

- [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror)
- [Pi-hole](https://pi-hole.net)

## Installation

1. Clone this repo into `~/MagicMirror/modules` directory.
   `git clone https://github.com/sheyabernstein/MMM-pihole-stats`
2. Obtain your Pi-Hole password or create an app password.
3. Configure your `~/MagicMirror/config/config.js`.

Here is an example entry for `config.js`:

```js
{
    module: "MMM-pihole-stats",
    position: "top_left", // Or any valid MagicMirror position.
    config: {
      apiURL: "http://pi.hole:443/api", // find or modify api port in (http://pi.hole/api/docs/#)
      apiKey: "your pi.hole password or app password",
      // See 'Configuration options' for more information.
    }
},
```

## Configuration Options

| **Option**               | **Default**          | **Description**                                                                                                                     |
| ------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `apiURL`                 | `http://pi.hole/api` | Absolute URL to Pi-hole API, including HTTP protocol and port                                                                       |
| `apiKey`                 |                      | Pi-hole password or app password                                                                                                    |
| `showSources`            | `true`               | Show request sources (clients)                                                                                                      |
| `sourcesCount`           | `10`                 | Number of returned entries for `showSources`                                                                                        |
| `showSourceHostnameOnly` | `true`               | Only show hostname if applicable without showing IP address                                                                         |
| `updateInterval`         | `600000`             | Time in ms to wait until updating                                                                                                   |
| `retryDelay`             | `30000`              | Time in ms to wait before retry                                                                                                     |
| `floatingPoints`         | `2`                  | Format floating point numbers to decimal points, e.g. `2` to format to 5.55. Setting this to `0` will show unlimited decimal points |

## Contributing

Thank you for considering contributing to this project! To maintain a consistent and high-quality codebase, we ask contributors to follow these guidelines:

### Development Setup

1. Install dependencies:
    ```bash
    npm install --with=dev
    ```
2. Install Git hooks:
    ```bash
    npm run install-hooks
    ```

### Making Changes

- Please make sure to create a new branch for your changes:
    ```bash
    git checkout -b feature-branch
    ```
- All changes should be made in your feature branch, not directly in the `master` branch.

### Submitting Changes

#### Pull Requests (PRs):

- Fork the repository and create a new branch for your changes.
- Make your changes and test them thoroughly.
- Submit a pull request to the master branch of the original repository.
- Ensure your pull request passes all automated checks.

### Important Notes

#### No Direct Pushes:

- Do not push changes directly to the master branch.
- All changes must be made via a pull request.

#### Continuous Integration (CI):

- Make sure your changes pass all CI checks before submitting a pull request.
