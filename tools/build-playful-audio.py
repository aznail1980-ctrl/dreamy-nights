"""Original toy percussion, rendered offline as WAV (no runtime synth or sampled weapons)."""
from pathlib import Path
import json
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'assets/audio-v429';DEST.mkdir(exist_ok=True)
SR=32000
rng=np.random.default_rng(429)
manifest={}
def toy(freq=620,length=.20,star=False,up=False):
    t=np.arange(int(SR*length))/SR
    # A soft rubber membrane rebounds in pitch; no bass thump or metallic impact.
    contour=(1+.48*np.exp(-t/0.018)-.22*np.exp(-((t-.047)/.025)**2)+.12*np.exp(-((t-.092)/.025)**2))
    if up:contour=.7+.75*(1-np.exp(-t/.05))
    phase=2*np.pi*np.cumsum(freq*contour)/SR
    env=(1-np.exp(-t/.0025))*np.exp(-t/(.046 if star else .054))
    a=(np.sin(phase+.35*np.exp(-t/.025)*np.sin(phase*2))+.16*np.sin(phase*2.03))*env
    if star:a+=.22*np.sin(phase*2.5)*np.exp(-t/.035)*(1-np.exp(-t/.003))
    air=sosfilt(butter(2,[900,3400],btype='bandpass',fs=SR,output='sos'),rng.normal(size=len(t)))
    a+=air*.08*np.exp(-t/.012)*(1-np.exp(-t/.001))
    a[-160:]*=np.linspace(1,0,160)
    return a
def mix(parts,length):
    a=np.zeros(int(length*SR))
    for clip,gain,delay in parts:
        i=round(delay*SR);n=min(len(clip),len(a)-i)
        if n>0:a[i:i+n]+=clip[:n]*gain
    return a
def save(name,parts,length,description):
    a=mix(parts,length)
    a=sosfilt(butter(2,180,btype='highpass',fs=SR,output='sos'),a)
    a*=.68/max(.01,float(np.max(abs(a))))
    a[:64]*=np.linspace(0,1,64);a[-256:]*=np.linspace(1,0,256)
    sf.write(DEST/(name+'.wav'),a,SR,subtype='PCM_16')
    spectrum=abs(np.fft.rfft(a))**2;hz=np.fft.rfftfreq(len(a),1/SR)
    manifest[name]={'file':'assets/audio-v429/'+name+'.wav','seconds':length,'design':description,'peak':float(max(abs(a))),'bassEnergyUnder180Hz':float(spectrum[hz<180].sum()/spectrum.sum())}
for hero in ['ari','popo']:
    star=hero=='ari';f=870 if star else 540
    for v in range(2):
        base=f*(1+v*.07)
        save(f'strike-basic-{hero}-{v}',[(toy(base,star=star),1,0)],.23,'star pop' if star else 'rubber toy mallet bop')
        save(f'strike-plunge-{hero}-{v}',[(toy(base*.94,star=star),1,0),(toy(base*1.34,star=star),.42,.105)],.37,'bop with one light rebound')
        save(f'strike-charged-{hero}-{v}',[(toy(base,star=star),1,0),(toy(base*1.25,star=star),.48,.08),(toy(base*1.5,star=star),.30,.17)],.46,'bright three-bounce impact, no heavy bass')
    for kind,factor,length in [('basic',1.12,.14),('plunge',1.25,.18),('charged',1.42,.23)]:
        save(f'swing-{kind}-{hero}',[(toy(f*factor,length,star,True),1,0)],length,'short elastic preparation chirp, no knife whoosh')
    patterns={
        'jump':[(1.08,0)],'dodge':[(1.22,0),(1.5,.055)],'ready':[(1.35,0),(1.7,.085)],
        'skill':[(1.15,0),(1.45,.075),(1.8,.15)],'guard':[(1.3,0),(1.6,.11)],
        'control':[(1.6,0),(1.15,.07),(1.4,.15)],'burst':[(1,0),(1.25,.09),(1.5,.18),(2,.27)],
        'hurt':[(.92,0)],'purify':[(1.4,0),(1.8,.085)]}
    for kind,notes in patterns.items():
        save(f'action-{kind}-{hero}',[(toy(f*k,star=star,up=kind in ['jump','dodge']),.75**i,d) for i,(k,d) in enumerate(notes)],notes[-1][1]+.24,'character '+kind+' toy-pop motif')
for name,notes in {'grade-rare':[(1320,0),(1650,.065)],'grade-unique':[(1320,0),(1650,.065),(1980,.13)],'forge-spark':[(1560,0)],'forge-resonance':[(1440,0),(1920,.085)]}.items():
    save(name,[(toy(f,star=True),.7**i,d) for i,(f,d) in enumerate(notes)],notes[-1][1]+.24,'light star-bubble upgrade accent')
for v in range(2):
    save(f'swish-{v}',[(toy(700+v*120,.15,False,True),1,0)],.15,'soft creature motion puff, replacing a shared blade swish')
(DEST/'sources.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(DEST/'CREDITS.txt').write_text('Original game sound design for Our Dreamy Nights, v4.29.0.\nOffline mathematical synthesis of short rubber-membrane pitch rebounds, star pops and soft filtered air transients. No third-party audio samples, knife/metal recordings, voice actor recordings, or MIDI music.\nGenerated with tools/build-playful-audio.py (deterministic seed 429). PCM 16-bit mono, 32 kHz.\n')
(ROOT/'combat-audio-assets.js').write_text("'use strict';\nObject.assign(DREAM_AUDIO_ASSETS.effects,"+json.dumps({k:{'file':v['file']} for k,v in manifest.items()},indent=2)+');\n')
assert len(manifest)==42
assert max(v['bassEnergyUnder180Hz'] for v in manifest.values())<.01
print('PASS',len(manifest),'original playful clips; no sample sources; bass energy <1%; peak <=0.68')
