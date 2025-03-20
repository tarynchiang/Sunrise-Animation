//////////////////////////////////////////////////////////////////////////////////////////
//
// SHADERS 
//
//////////////////////////////////////////////////////////////////////////////////////////

const FRAGMENT_SHADER_HEADER = `
   precision highp float;

   float noise(vec3 point) { 
      float r = 0.; 
      for (int i=0;i<16;i++) {
         vec3 D, p = point + mod(vec3(i,i/4,i/8), vec3(4.0,2.0,2.0)) + 1.7*sin(vec3(i,5*i,8*i)), C=floor(p), P=p-C-.5, A=abs(P);

         C += mod(C.x+C.y+C.z,2.) * step(max(A.yzx,A.zxy),A) * sign(P);
         D = 34.*sin(987.*float(i) + 876.*C + 76.*C.yzx + 765.*C.zxy);
         P=p-C-.5;
         r += sin(6.3*dot(P,fract(D)-.5)) * pow(max(0.,1.-2.*dot(P,P)),4.);
      } 
      
      return .5 * sin(r); 
   }
`

const DEFAULT_VERTEX_SHADER = `
      attribute vec3 aPos;
      varying   vec3 vPos;
      void main() {
         gl_Position = vec4(aPos, 1.);
         vPos = aPos;
      }
`;

const DEFAULT_FRAGMENT_SHADER = `
    uniform float uTime;

    varying vec3 vPos;

    void main() {
    // Convert vPos from [-1, 1] to normalized device coordinates (NDC)
    vec2 ndc = vPos.xy;
    
    // Define delay and fade-in durations
    float delay = 3.0;      // Delay duration in seconds before the sun starts to appear
    float fadeInTime = 2.0; // Duration of the sun's fade-in effect in seconds

    // Calculate adjusted time since the sun starts appearing
    float adjustedTime = max(uTime - delay, 0.0);

    // Calculate fade-in progress (from 0.0 to 1.0)
    float fadeInProgress = clamp(adjustedTime / fadeInTime, 0.0, 1.0);

    // Calculate sun alpha (opacity) based on fade-in progress
    float sunAlpha = fadeInProgress;

    // Sun rise begins after fade-in
    float sunRiseTime = 10.0; // Duration of the sun rising in seconds
    float sunMoveTime = adjustedTime - fadeInTime; // Time since sun started moving

    // Calculate the sun's vertical position
    float sunStartY = -1.5; // Start below the screen
    float sunEndY = 0.0;    // End at the horizon
    float sunY = sunStartY;

    if (sunMoveTime > 0.0) {
        // Sun starts rising after fade-in
        float sunProgress = clamp(sunMoveTime / sunRiseTime, 0.0, 1.0);
        sunY = mix(sunStartY, sunEndY, sunProgress);
    }

    // Calculate the sun's position
    vec2 sunPosition = vec2(0.0, sunY);
    float sunRadius = 0.2;

    // Calculate distance from the current fragment to the sun's center
    float dist = distance(ndc, sunPosition);

    // Determine if the fragment is within the sun
    float circle = smoothstep(sunRadius, sunRadius - 0.01, dist);

    // Create a radial gradient for the sun
    float sunIntensity = 1.0 - smoothstep(0.0, sunRadius, dist);

    // Set sun color with radial gradient
    vec3 sunColor = vec3(1.0, 0.9, 0.6);

    // Add a glow effect
    float glowFalloff = sunRadius * 0.85; // Adjust for desired glow softness
    float glowRadius = sunRadius * 2.5;
    float glowIntensity = exp(-pow(dist - sunRadius, 2.0) / (2.0 * glowFalloff * glowFalloff));

    // Set glow color
    vec3 glowColor = vec3(1.0, 0.8, 0.5);

    // Calculate sun progress for sky color transitions
    float totalTransitionTime = fadeInTime + sunRiseTime; // Total time for sky transition
    float skyProgress = clamp((adjustedTime) / totalTransitionTime, 0.0, 1.0);

    // Define key sky colors
    vec3 nightSkyColor = vec3(0.0, 0.0, 0.1);       // Night sky color
    vec3 dawnSkyColor = vec3(0.5, 0.0, 0.2);        // Dawn sky color
    vec3 sunriseSkyColor = vec3(1.0, 0.5, 0.0);     // Sunrise sky color
    vec3 morningSkyColor = vec3(0.5, 0.7, 1.0);     // Morning sky color

    // Interpolate sky top and bottom colors
    vec3 skyTopColor = mix(nightSkyColor, morningSkyColor, skyProgress);
    vec3 skyBottomColor = mix(dawnSkyColor, sunriseSkyColor, skyProgress);


    // Calculate the vertical gradient factor
    float verticalFactor = (ndc.y + 1.0) / 2.0;

    // Calculate the horizontal distance from the sun (X-axis)
    float horizontalDist = abs(ndc.x - sunPosition.x);

    // Adjust 'dawnSkyColor' over time
    vec3 adjustedDawnSkyColor = mix(dawnSkyColor, skyTopColor, skyProgress);

    // Adjust the horizontal mixing factor and clamp it
    float horizonMixFactor = clamp(horizontalDist * 2.0, 0.0, 1.0);

    // Define horizon colors        
    vec3 horizonColor = mix(sunriseSkyColor, adjustedDawnSkyColor, horizonMixFactor);

    // Adjust the sky color based on the distance from the horizon and the sun
    float horizonBlend = exp(-pow((ndc.y - sunY) * 5.0, 2.0)) * (1.0 - skyProgress);

    // Blend the sky color vertically and horizontally
    vec3 skyColor = mix(skyTopColor, horizonColor, horizonBlend);


    // Add sun halo effect
    float sunRadialFactor = exp(-pow(dist / (sunRadius * 5.0), 2.0)) * sunAlpha;
    vec3 sunHaloColor = vec3(1.0, 0.7, 0.3);
    skyColor = mix(skyColor, sunHaloColor, sunRadialFactor);

    // Add atmospheric scattering effect
    float scattering = exp(-pow((ndc.y - sunY) * 5.0, 2.0)) * sunAlpha;
    skyColor = mix(skyColor, vec3(1.0, 0.5, 0.0), scattering * 0.2);

    // Start with sky color
    vec3 color = skyColor;

    // Add the glow effect
    color += glowColor * glowIntensity;

    // Add the sun effect
    color += sunColor * sunIntensity;

    // Clamp the final color
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
    }
`;

const NUMBER_OF_LINES_FRAGMENT_SHADER_HEADER = FRAGMENT_SHADER_HEADER.split('\n').length; // NUMBER OF LINES OF CODE IN FRAGMENT_SHADER_HEADER
const TEXT_EDITOR_LINE_HEIGHT = 20;