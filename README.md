# DOPPLE ASSIGNMENT - QUESTION 2

## How to run this project using python:

1. Open a terminal or command prompt
2. Make sure you have python installed
3. Navigate to the project folder: cd path/to/project
4. Start a local server:  python -m http.server 8000  
5. Open http://localhost:8000/ in a browser


### Notes 

- Uses Three.js via CDN, so there's no need to install dependencies
- The test-files directory includes some example models you could test this with
- Focused on desktop use. Has not yet been thoroughly tested on various mobile devices.
- Focused on simple static models. Has not yet been thoroughly tested on complex scenes with animations, etc.
- Variants in gltf: The exporter on its own doesn't export the variants. There are various options and plugins that could solve this. What I did was first take it in its json form, then manually add the variants into the various places they should be, then convert that to glb for export. Note that the variants are still also placed into the nodes under "extras" - the script could be modified to remove that.
- The GUI could use much improvement. Currently I prioritized the speicific things that were asked, and each model has its own variant names for separate control. I also considered a use case of "themes" where the variant names could be shared, and the user flow would start with picking a theme and then have one color picker hover over each mesh... Those are improvements we could make depending on intended use cases.
- Could also improve by adding more customization, such as user editing variant names, etc.
- The resulting file is saved under downloads, could improve that
- User can preview the 3 variants but if existing variants were already in the file, user cannot preview those. We could adjust this and actually enable the user to preview the preexisting variants as well.
- We could allow users to select a mesh via dropdown, but i found clicking to be more intuitive. we could also add both options in case of an object being hard to click on, and then we'd make sure clicking an object also updates the dropdown, and both selection methods highlight the select objects.
- Noticed certain warnings with some validators with the resulting files. Files still work fine in blender, and in viewers like modelviewer editor online, but can make some improvements to get rid of those issues as well.
