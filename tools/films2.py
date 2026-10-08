"""Author new diagram films: each is an SVG figure (its final frame, readable without JS) plus a film spec.
Elements are named while drawing; cues refer to names and are resolved to indices here."""
import json, re, sys
INK = '#141412'; PAPER = '#f4efe3'; WARM = '#e7833b'
SANS = 'font-family="ui-sans-serif,-apple-system,Segoe UI,Arial,sans-serif"'
SERIF = 'font-family="Georgia,Times New Roman,serif"'
MONO = 'font-family="ui-monospace,Menlo,Consolas,monospace"'


class Fig:
    def __init__(s, id, w, h, label, bg=PAPER):
        s.id, s.w, s.h, s.label, s.bg = id, w, h, label, bg
        s.els = []; s.names = {}; s.defs = ''

    def add(s, name, mk):
        """one drawable element (no groups), so indices stay one per element"""
        if name:
            assert name not in s.names, name
            s.names[name] = len(s.els)
        s.els.append(mk)

    def i(s, n):
        if isinstance(n, (list, tuple)):
            return [s.i(x) for x in n]
        if isinstance(n, int):
            return n
        if n.endswith('*'):
            return [v for k, v in s.names.items() if k.startswith(n[:-1])]
        return s.names[n]

    def svg(s):
        out = '<svg viewBox="0 0 %d %d" data-film="%s" role="img" aria-label="%s" style="display:block;width:100%%;height:auto">' % (s.w, s.h, s.id, s.label)
        if s.defs:
            out += '<defs>' + s.defs + '</defs>'
        out += '<rect width="%d" height="%d" fill="%s"/>' % (s.w, s.h, s.bg)
        return out + ''.join(s.els) + '</svg>'


def t(x, y, txt, size=14, fam=SANS, fill=INK, weight=400, anchor='start', extra=''):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s"%s>%s</text>' % (
        x, y, fam, size, weight, fill, anchor, (' ' + extra) if extra else '', txt)


FILMS = {}


def resolve(F, spec):
    out = dict(spec)
    out['cue'] = []
    for c in spec['cue']:
        ids = F.i(c[0])
        out['cue'].append([ids] + list(c[1:]))
    if 'slips' in spec:
        sl = []
        for S in spec['slips']:
            segs = []
            for g in S['segs']:
                g = list(g)
                if isinstance(g[2], dict) and 'p' in g[2]:
                    g[2] = dict(g[2]); g[2]['p'] = F.i(g[2]['p'])
                segs.append(g)
            sl.append({'segs': segs, **({'hide': S['hide']} if 'hide' in S else {})})
        out['slips'] = sl
    return out


# ------------------------------------------------------------------ Ripples · the blueberry test
def ripples():
    F = Fig('blueberry', 960, 540, 'The blueberry test: on the left the eaten blueberry returns untouched; on the right it leaves stained soil and a worm')
    BERRY = '#4b5fa8'
    F.add('div', '<line x1="480" y1="24" x2="480" y2="516" stroke="#cbc5b7" stroke-width="1.5"/>')
    for side, ox, title, sub in (('L', 0, 'FRESH LANGUAGE', 'the prose keeps flowing'), ('R', 480, 'A WORLD THAT REMEMBERS', 'an action leaves a mark')):
        F.add(side + 'title', t(ox + 32, 46, title, 13, SANS, '#9a3328' if side == 'L' else '#315d79', 700, extra='letter-spacing="2"'))
        F.add(side + 'sub', t(ox + 32, 70, sub, 15, SERIF, '#5f5b52'))
        F.add(side + 'soil', '<rect x="%d" y="404" width="440" height="26" fill="#e3d6c0"/>' % (ox + 20))
        F.add(side + 'ground', '<path d="M%d 404H%d" stroke="%s" stroke-width="2"/>' % (ox + 20, ox + 460, INK))
        F.add(side + 'grass', '<path d="%s" stroke="#5c7a45" stroke-width="2" fill="none" stroke-linecap="round"/>' % ''.join(
            'M%d 404l-4 -12M%d 404l5 -10 ' % (ox + 40 + k * 38, ox + 46 + k * 38) for k in range(11)))
        F.add(side + 'trunk', '<path d="M%d 404 C %d 330 %d 250 %d 150" stroke="#6b4f35" stroke-width="10" fill="none" stroke-linecap="round"/>' % (ox + 90, ox + 96, ox + 80, ox + 70))
        F.add(side + 'branch', '<path d="M%d 152 C %d 140 %d 140 %d 150" stroke="#6b4f35" stroke-width="6" fill="none" stroke-linecap="round"/>' % (ox + 64, ox + 160, ox + 240, ox + 320))
        F.add(side + 'leaves', '<path d="M%d 150q10 -18 26 -10q-12 14 -26 10zM%d 146q12 -16 26 -6q-14 12 -26 6zM%d 152q14 -12 24 0q-14 8 -24 0z" fill="#7ea26a" stroke="%s" stroke-width="1.6"/>' % (ox + 120, ox + 262, ox + 300, INK))
    # left: the berry is back on the grass
    F.add('Lberry', '<circle cx="300" cy="392" r="11" fill="%s" stroke="%s" stroke-width="2"/>' % (BERRY, INK))
    F.add('Lglint', '<path d="M292 380l-6 -8M300 376v-10M308 380l6 -8" stroke="#e1b84a" stroke-width="2.4" stroke-linecap="round"/>')
    F.add('Lq', t(326, 378, '?', 34, SERIF, '#9a3328', 700))
    F.add('Lt1', t(32, 462, 'Turn 1 · “The bird pecks the blueberry.”', 15, SERIF))
    F.add('Lt3', t(32, 488, 'Turn 3 · “The blueberry glints in the grass.”', 15, SERIF))
    F.add('Lverdict', t(32, 514, 'The world forgot.', 15, SANS, '#9a3328', 700))
    # right: the berry left a mark
    F.add('Rstain', '<ellipse cx="770" cy="416" rx="62" ry="9" fill="#5b3f73" opacity=".38"/>')
    F.add('Rworm', '<path d="M724 418 q8 -8 16 0 t16 0 t16 0 t16 0" stroke="#c77b8a" stroke-width="6" fill="none" stroke-linecap="round"/>')
    F.add('Rt1', t(512, 462, 'Turn 1 · “The bird swallows the blueberry.”', 15, SERIF))
    F.add('Rt3', t(512, 488, 'Turn 3 · “The earthworm moves through stained soil', 15, SERIF))
    F.add('Rt3b', t(512, 510, 'beneath the branch where the bird fed.”', 15, SERIF))
    BERRYART = '<path d="M0 -12V-4" stroke="#3c5a2a" stroke-width="2"/><circle cy="5" r="10" fill="%s" stroke="%s" stroke-width="2"/><circle cx="-3" cy="2" r="2.6" fill="#fff" opacity=".75"/>' % (BERRY, INK)

    def bird(ox, leave):
        # flies down onto the branch once it is drawn, and lands with a squash
        k = [[18, {'x': ox + 120, 'y': -50, 'wing': 1}], [24, {'x': ox + 150, 'y': 40, 'wing': 0}], [30, {'x': ox + 180, 'y': 110, 'wing': 1}],
             [34, {'x': ox + 196, 'y': 151, 'wing': 0, 'sy': .78, 'sx': 1.12}, 'in'], [38, {'y': 150, 'sy': 1, 'sx': 1}, 'overshoot'],
             [44, {'headA': 28, 'look': 1}], [50, {'headA': -16, 'headDy': -3}], [53, {'headA': 70, 'headDy': 4, 'beak': 1}, 'linear'],
             [58, {'headA': 60, 'beak': 0}], [62, {'headA': -10, 'headDy': -6, 'beak': .6}], [68, {'headA': 0, 'headDy': 0, 'beak': 0}]]
        if leave:
            k += [[96, {'x': ox + 196, 'y': 150}], [100, {'sy': .8, 'y': 152}], [106, {'x': ox + 260, 'y': 92, 'sy': 1.1, 'wing': 1}, 'in'],
                  [114, {'x': ox + 340, 'y': 60, 'wing': 0}], [122, {'x': ox + 430, 'y': 30, 'wing': 1}], [130, {'x': ox + 540, 'y': 10, 'wing': 0}]]
        else:
            k += [[120, {'look': 1}], [126, {'headA': 30, 'look': 1}], [136, {'headA': 30}], [140, {'headA': 0}]]
        return {'rig': 'bird', 'base': {'k': 1.45, 'dir': 1}, 'keys': k}

    spec = {'len': 190,
            'cue': [['div', 0, 16, 'draw'], [['Ltitle', 'Rtitle'], 2, 12, 'type'], [['Lsub', 'Rsub'], 10, 12, 'type'],
                    [['Lsoil', 'Rsoil'], 0, 10, 'fade'], [['Lground', 'Rground'], 0, 14, 'draw'], [['Lgrass', 'Rgrass'], 6, 12, 'fade'],
                    [['Ltrunk', 'Rtrunk'], 4, 14, 'draw'], [['Lbranch', 'Rbranch'], 12, 12, 'draw'], [['Lleaves', 'Rleaves'], 18, 8, 'pop'],
                    [['Lt1', 'Rt1'], 56, 16, 'words'],
                    ['Lberry', 122, 10, 'pop'], ['Lglint', 130, 8, 'pop'], ['Lberry', 138, 10, 'pulse', 'inout', .35], ['Lt3', 124, 18, 'words'], ['Lq', 146, 8, 'pop'], ['Lverdict', 152, 10, 'type'],
                    ['Rstain', 122, 16, 'fade'], ['Rworm', 134, 18, 'draw'], ['Rt3', 136, 14, 'words'], ['Rt3b', 150, 12, 'words']],
            'cast': [bird(0, False), bird(480, True),
                     {'rig': 'prop', 'art': BERRYART, 'base': {'x': 236, 'y': 168}, 'keys': [[22, {'s': 0}], [28, {'s': 1}, 'overshoot'], [53, {}], [56, {'o': 0}, 'linear']]},
                     {'rig': 'prop', 'art': BERRYART, 'base': {'x': 716, 'y': 168}, 'keys': [[22, {'s': 0}], [28, {'s': 1}, 'overshoot'], [53, {}], [56, {'o': 0}, 'linear']]}],
            'beats': [[0, 'A bird eats a blueberry.'], [80, 'Two turns pass.'], [120, 'Left: the blueberry returns, blue, round, untouched.'],
                      [136, 'Right: the berry has left a mark in the soil.'], [160, 'An action should still be felt several turns later.']]}
    return F, spec, 'Film. The blueberry test, drawn from the talk: the same bird and berry in a system that only produces fresh language, and in one that keeps a world.'


# ------------------------------------------------------------------ LEGO · a brick written as a line
def lego():
    F = Fig('ldraw', 960, 540, 'Four LDraw lines place four bricks; the third line is half a stud off and its brick cannot connect')
    F.add('codebox', '<rect x="28" y="64" width="452" height="250" rx="8" fill="#1c1d21" stroke="%s" stroke-width="2"/>' % INK)
    F.add('codehd', t(28, 46, 'A BRICK WRITTEN AS A LINE', 13, SANS, '#9a3328', 700, extra='letter-spacing="2"'))
    F.add('legend', t(48, 96, '1 colour  x  y  z  rotation(9)  part', 12, MONO, '#8f8a7e'))
    lines = [('1 4  0 -24 0  1 0 0 0 1 0 0 0 1  3001.dat', '#e06b5c', '✓'), ('1 1  40 -48 0  1 0 0 0 1 0 0 0 1  3001.dat', '#7aa2d6', '✓'),
             ('1 14 -10 -48 0  1 0 0 0 1 0 0 0 1  3003.dat', '#e1b84a', '✗'), ('1 2  80 -72 0  1 0 0 0 1 0 0 0 1  3003.dat', '#7fb27f', '✓')]
    for k, (ln, col, mk) in enumerate(lines):
        F.add('ln%d' % k, t(48, 136 + k * 40, ln, 14.5, MONO, col))
        F.add('ok%d' % k, t(452, 136 + k * 40, mk, 18, SANS, '#7fb27f' if mk == '✓' else '#e5534b', 700, 'end'))
    F.add('err', t(48, 296, 'x = -10: half a stud left. Nothing for it to grip.', 13.5, SANS, '#e5534b', 600))
    # baseplate and bricks, oblique projection: 1 stud = 30px wide, depth 2 studs = (30,-18), one brick = 36px tall
    F.add('plate', '<path d="M520 420 L920 420 L950 402 L550 402 Z" fill="#7e9f6a" stroke="%s" stroke-width="2"/>' % INK)
    F.add('platef', '<rect x="520" y="420" width="400" height="12" fill="#5f7f50" stroke="%s" stroke-width="2"/>' % INK)
    F.add('platehd', t(520, 46, 'WHAT THE LINES BUILD', 13, SANS, '#9a3328', 700, extra='letter-spacing="2"'))
    cols = {'r': ('#d9493b', '#b33a2e', '#f07a6c'), 'b': ('#3d6fb3', '#2e5690', '#6b97d6'), 'y': ('#e8b730', '#c4961f', '#f4d26b'), 'g': ('#4f9a52', '#3c7a3f', '#7fc282')}

    def brick(name, sx, ly, wst, c, lift=0, bad=False):
        x0 = 600 + sx * 30; W = wst * 30; y0 = 420 - (ly + 1) * 36 - lift; dx, dy = 30, -18
        front, side, top = cols[c]
        F.add(name + 's', '<path d="M%g %g L%g %g L%g %g L%g %g Z" fill="%s" stroke="%s" stroke-width="2" stroke-linejoin="round"/>' % (x0 + W, y0, x0 + W + dx, y0 + dy, x0 + W + dx, y0 + dy + 36, x0 + W, y0 + 36, side, INK))
        F.add(name + 't', '<path d="M%g %g L%g %g L%g %g L%g %g Z" fill="%s" stroke="%s" stroke-width="2" stroke-linejoin="round"/>' % (x0, y0, x0 + W, y0, x0 + W + dx, y0 + dy, x0 + dx, y0 + dy, top, INK))
        F.add(name + 'u', '<path d="%s" fill="%s" stroke="%s" stroke-width="1.6"/>' % (''.join(
            'M%g %g a8 4 0 1 0 16 0 a8 4 0 1 0 -16 0' % (x0 + (i + .5) * 30 + (j + .5) * 15 - 8, y0 + (j + .5) * -9 - 2) for j in (1, 0) for i in range(wst)), top, INK))
        F.add(name + 'f', '<rect x="%g" y="%g" width="%g" height="36" fill="%s" stroke="%s" stroke-width="2"/>' % (x0, y0, W, front, INK))
        if bad:
            F.add(name + 'x', '<rect x="%g" y="%g" width="%g" height="%g" fill="none" stroke="#e5534b" stroke-width="2.5" stroke-dasharray="7 5"/>' % (x0 - 8, y0 + dy - 8, W + dx + 16, 36 - dy + 16))
    # painter's order: lower layers first, then left to right
    brick('b0', 0, 0, 4, 'r')
    brick('b2', -0.5, 1, 2, 'y', lift=10, bad=True)
    brick('b1', 1.333, 1, 4, 'b')
    brick('b3', 2.667, 2, 2, 'g')
    F.add('foot', t(520, 480, 'A picture is cheap. A build is legal parts, exact', 15, SERIF))
    F.add('foot2', t(520, 504, 'placements, real connections, correctable decisions.', 15, SERIF))
    B = lambda n: [n + 's', n + 't', n + 'u', n + 'f']
    cue = [['codebox', 0, 10, 'pop'], ['codehd', 4, 12, 'type'], ['legend', 12, 16, 'type'], [['plate', 'platef'], 6, 12, 'pop'], ['platehd', 10, 12, 'type']]
    for k, (n, f0) in enumerate((('b0', 30), ('b1', 66), ('b2', 102), ('b3', 140))):
        cue += [['ln%d' % k, f0, 14, 'type', 'linear'], [B(n), f0 + 14, 12, 'enter', 'overshoot', [0, -150]], ['ok%d' % k, f0 + 28, 6, 'pop']]
    cue += [['b2x', 132, 10, 'pop'], [B('b2'), 132, 14, 'pulse', 'inout', .06], ['err', 134, 16, 'type'], ['ok2', 136, 10, 'pulse', 'inout', .4],
            ['foot', 170, 16, 'words'], ['foot2', 182, 14, 'words']]
    spec = {'len': 204, 'cue': cue,
            'beats': [[0, 'A brick written as a line: colour, position, rotation, part.'], [30, 'Each line places one part.'], [66, 'A second brick, two studs over, one layer up.'],
                      [102, 'The third line says x = -10: half a stud left.'], [132, 'It looks placed. It has nothing to grip.'], [140, 'The fourth line builds on.'],
                      [170, 'The coordinates are not the construction.']]}
    return F, spec, 'Film. A build as a sequence of lines. LDraw units: one stud is 20, one brick is 24 high; 3001 is a 2×4 brick, 3003 a 2×2.'


# ------------------------------------------------------------------ Play Freedom · the image arrives before the movie
def playfreedom():
    F = Fig('arrives', 960, 540, 'Four fluent images arrive at once; a filmmaker hesitates, keeps the refused images, and builds the film from comparison, refusal, recurrence, montage and sound')
    F.defs = ('<radialGradient id="pfg" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#9ff3e0"/><stop offset=".5" stop-color="#2c8a8a"/><stop offset="1" stop-color="#0f2a3d"/></radialGradient>'
              '<linearGradient id="pfa" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f08a3c"/><stop offset="1" stop-color="#fbe3a0"/></linearGradient>')
    F.add('title', t(40, 42, 'THE IMAGE ARRIVES BEFORE THE MOVIE', 13, SANS, '#9a3328', 700, extra='letter-spacing="2"'))
    X = [40, 268, 496, 724]; Y = 62; W = 196; H = 140
    names = ['WONDER', 'FRACTURE', 'MEMORY', 'ASCENT']
    subs = ['a forest glows', 'a face fractures', 'a colour grade for the past', 'a camera that rises']
    fills = ['url(#pfg)', '#2a2230', '#c9b08a', 'url(#pfa)']
    for k in range(4):
        x = X[k]
        F.add('card%d' % k, '<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="%s" stroke="%s" stroke-width="2"/>' % (x, Y, W, H, fills[k], INK))
        if k == 0:
            m = ''.join('M%d %d l14 -46 l14 46z' % (x + 14 + j * 26, Y + H - 6) for j in range(7))
            F.add('motif0', '<path d="%s" fill="#0c3b3b" stroke="#9ff3e0" stroke-width="1.2"/>' % m)
        elif k == 1:
            F.add('motif1', '<path d="M%d %d l30 -6 l6 34 l-28 10z M%d %d l26 4 l-4 36 l-24 -8z M%d %d l40 -2 l-8 30 l-30 -4z" fill="#d9c4b8" stroke="#141412" stroke-width="1.5"/>' % (x + 60, Y + 30, x + 100, Y + 34, x + 70, Y + 82))
        elif k == 2:
            F.add('motif2', '<path d="M%d %d v-34 l30 -22 l30 22 v34z M%d %d h120" fill="#a8885e" stroke="#7a6040" stroke-width="2" opacity=".75"/>' % (x + 66, Y + 116, x + 36, Y + 116))
        else:
            F.add('motif3', '<path d="M%d %d L%d %d L%d %d L%d %d Z M%d %d v-30 M%d %d l8 8 M%d %d l-8 8" fill="#7a3b1e" stroke="%s" stroke-width="2"/>' % (
                x + 10, Y + H - 4, x + 98, Y + 40, x + 150, Y + 90, x + 190, Y + H - 4, x + 98, Y + 36, x + 98, Y + 6, x + 98, Y + 6, INK))
        F.add('name%d' % k, t(x, Y + H + 22, names[k], 12, SANS, INK, 700, extra='letter-spacing="1.5"'))
        F.add('sub%d' % k, t(x, Y + H + 42, subs[k], 14, SERIF, '#5f5b52'))
    # the film strip
    F.add('filmhd', t(200, 300, 'THE FILM', 12, SANS, '#9a3328', 700, extra='letter-spacing="2"'))
    F.add('film', '<rect x="200" y="310" width="720" height="70" rx="4" fill="#fffdf6" stroke="%s" stroke-width="2"/>' % INK)
    F.add('perf', '<path d="%s" stroke="%s" stroke-width="2"/>' % (''.join('M%d 316h10M%d 374h10' % (210 + j * 30, 210 + j * 30) for j in range(24)), '#cbc5b7'))
    slots = ['hesitate', 'compare', 'refuse', 'recur', 'montage + sound']
    for j, s in enumerate(slots):
        if j < 4:
            F.add('slot%d' % j, '<line x1="%d" y1="322" x2="%d" y2="368" stroke="#cbc5b7" stroke-width="1.5"/>' % (200 + 144 * (j + 1), 200 + 144 * (j + 1)))
        F.add('sl%d' % j, t(200 + 144 * j + 72, 352, s, 16, SERIF, INK, 400, 'middle'))
    F.add('trayhd', t(200, 414, 'KEPT, NOT USED: THE REFUSED GENERATIONS', 12, SANS, '#5f5b52', 700, extra='letter-spacing="2"'))
    F.add('tray', '<rect x="200" y="424" width="420" height="76" rx="4" fill="none" stroke="#8f8a7e" stroke-width="2" stroke-dasharray="8 6"/>')
    for k in range(4):
        F.add('th%d' % k, '<rect x="%d" y="438" width="80" height="48" rx="3" fill="%s" stroke="%s" stroke-width="1.6"/>' % (216 + k * 100, fills[k], INK))
    F.add('close', t(650, 470, 'The film begins when', 17, SERIF))
    F.add('close2', t(650, 494, 'the image is not enough.', 17, SERIF))
    cue = [['title', 0, 12, 'type'], [['card0', 'card1', 'card2', 'card3', 'motif0', 'motif1', 'motif2', 'motif3'], 10, 4, 'pop', 'linear'],
           [['name0', 'name1', 'name2', 'name3'], 14, 6, 'type'], [['sub0', 'sub1', 'sub2', 'sub3'], 18, 10, 'type'],
           [['card0', 'card1', 'card2', 'card3'], 22, 14, 'pulse', 'inout', .04],
           [['film', 'perf'], 70, 14, 'draw'], ['filmhd', 70, 8, 'type'], ['sl0', 84, 10, 'type'], ['slot0', 88, 6, 'draw'],
           ['sl1', 100, 10, 'type'], ['slot1', 104, 6, 'draw'],
           ['tray', 110, 16, 'draw'], ['trayhd', 112, 14, 'type'], [['card0', 'motif0'], 114, 60, 'dim'], [['card1', 'motif1'], 124, 56, 'dim'], [['card2', 'motif2'], 134, 50, 'dim'], [['card3', 'motif3'], 144, 44, 'dim']]
    cue += [['th%d' % k, 126 + 10 * k, 6, 'pop'] for k in range(4)]
    cue += [['sl2', 120, 10, 'type'], ['slot2', 124, 6, 'draw'], ['sl3', 160, 10, 'type'], ['slot3', 164, 6, 'draw'], [['th0', 'card0'], 164, 12, 'pulse', 'inout', .06],
            ['sl4', 176, 12, 'type'], ['film', 190, 12, 'pulse', 'inout', .02], ['close', 196, 14, 'words'], ['close2', 206, 14, 'words']]
    slips = [{'segs': [[116 + 10 * k, 128 + 10 * k, [X[k] + W / 2, Y + H], [256 + k * 100, 462], 'inout', 30]], 'hide': 130 + 10 * k} for k in range(4)]
    cast = [{'rig': 'figure', 'base': {'y': 520, 'k': .8}, 'keys': [[28, {'x': -40, 'fA': [14, 0], 'fB': [-14, 0], 'hipH': 42}], [34, {'x': -10, 'fA': [1, 0], 'fB': [3, -9], 'hipH': 46}, 'linear'],
            [40, {'x': 20, 'fA': [-14, 0], 'fB': [14, 0], 'hipH': 42}, 'linear'], [46, {'x': 50, 'fA': [3, -9], 'fB': [1, 0], 'hipH': 46}, 'linear'], [52, {'x': 80, 'fA': [7, 0], 'fB': [-7, 0], 'hipH': 43}, 'linear'],
            [56, {'hipH': 44, 'gaze': [.4, -1], 'tilt': -.25}], [60, {'hF': [4, 26], 'lean': .06, 'hipH': 42}], [64, {'hF': [18, -22], 'lean': -.08, 'hipH': 45, 'say': 'wait', 'mouth': 'o'}, 'overshoot'],
            [84, {'say': 'wait'}], [86, {'say': None, 'mouth': 'flat', 'hF': [8, 28], 'lean': 0, 'gaze': [1, -.8]}], [96, {'gaze': [.2, -1]}], [104, {'gaze': [1, -.6]}],
            [116, {'hF': [20, -8], 'gaze': [1, .3], 'tilt': .1}], [150, {}], [160, {'hF': [8, 28], 'gaze': [1, 0], 'tilt': 0, 'mouth': 'smile'}]]}]
    spec = {'len': 226, 'cue': cue, 'slips': slips, 'cast': cast,
            'beats': [[0, 'Under production pressure, the image arrives first:'], [10, 'luminous wonder, fractured faces, nostalgic haze, triumphant ascent.'],
                      [56, 'Freedom begins with hesitation.'], [96, 'Compare.'], [112, 'Refuse, and keep what you refuse.'], [160, 'Let images recur.'],
                      [176, 'Then montage and sound.'], [196, 'The film begins when the image is not enough.']]}
    return F, spec, 'Film. The paper’s argument as a sequence: fluent images arrive before the film knows what they mean; authorship moves to delaying that certainty.'


# ------------------------------------------------------------------ Operative Ekphrasis · the shield keeps its changes
def ekphrasis():
    F = Fig('shield', 960, 540, 'One source passes through six transformations around a shield that gains a ring with each pass')
    F.defs = '<path id="ekring" d="M480 260 m-136 0 a136 136 0 1 1 272 0 a136 136 0 1 1 -272 0"/>'
    cx, cy = 480, 260
    rings = [(150, '#e9dcc0'), (118, '#d8c39a'), (86, '#c9a96e'), (54, '#b48a4a'), (22, '#8a6a34')]
    for k, (r, c) in enumerate(rings):
        F.add('ring%d' % k, '<circle cx="%d" cy="%d" r="%d" fill="%s" stroke="%s" stroke-width="2"/>' % (cx, cy, r, c, INK))
    F.add('ringtext', '<text %s font-size="12.5" fill="%s" letter-spacing="1"><textPath href="#ekring">THE EARTH · THE SKY · THE SEA · THE TIRELESS SUN · THE MOON · THE STARS · TWO CITIES · A FIELD · A VINEYARD ·</textPath></text>' % (SERIF, INK))
    st = [('HOMER’S TEXT', 'Iliad 18, the shield', 80, 50), ('IMAGE GENERATORS', 'the passage, submitted', 710, 50), ('WEBGL SHIELD', 'text as addressable zones', 740, 232),
          ('ANIMATION CODE', 'deterministic drawing', 710, 414), ('CONTACT SHEET', 'states, side by side', 80, 414), ('VISION MODEL', 'it looks, and describes', 50, 232)]
    for k, (a, b, x, y) in enumerate(st):
        F.add('box%d' % k, '<rect x="%d" y="%d" width="170" height="56" rx="6" fill="#fffdf6" stroke="%s" stroke-width="2"/>' % (x, y, INK))
        F.add('lab%d' % k, t(x + 85, y + 24, a, 12, SANS, INK, 700, 'middle', 'letter-spacing="1.2"'))
        F.add('sub%d' % k, t(x + 85, y + 44, b, 13, SERIF, '#5f5b52', 400, 'middle'))
    arcs = ['M250 78 C 400 30, 560 30, 710 78', 'M850 106 C 880 160, 880 190, 860 232', 'M860 288 C 880 330, 880 370, 850 414',
            'M710 442 C 560 494, 400 494, 250 442', 'M110 414 C 80 380, 80 330, 110 288', 'M110 232 C 80 190, 80 150, 110 106']
    for k, d in enumerate(arcs):
        F.add('arc%d' % k, '<path d="%s" fill="none" stroke="#9a3328" stroke-width="2.5" stroke-linecap="round"/>' % d)
    F.add('cap', t(480, 524, 'Each image is the residue of an earlier selection.', 16, SERIF, INK, 400, 'middle'))
    # one lap, slow; each station inks a ring of the shield
    cue = [['box0', 0, 10, 'pop'], ['lab0', 4, 10, 'type'], ['sub0', 10, 12, 'type']]
    slips = []
    segs = []
    f = 24
    for k in range(6):
        nxt = (k + 1) % 6
        cue.append(['arc%d' % k, f, 18, 'draw'])
        segs.append([f, f + 18, {'p': 'arc%d' % k}, 'inout'])
        if nxt != 0:
            cue += [['box%d' % nxt, f + 16, 10, 'pop'], ['lab%d' % nxt, f + 20, 8, 'type'], ['sub%d' % nxt, f + 24, 10, 'type']]
        else:
            cue += [[['box0', 'lab0', 'sub0'], f + 18, 12, 'pulse', 'inout', .06]]
        if k < 5:
            cue.append(['ring%d' % k, f + 18, 14, 'pop'])
        f += 30
    cue += [['ringtext', 64, 30, 'fade'], ['cap', f + 4, 24, 'words']]
    segs += [[f + 4 + 7 * k, f + 11 + 7 * k, {'p': 'arc%d' % k}, 'linear'] for k in range(6)]
    slips = [{'segs': segs, 'hide': f + 48}]
    spec = {'len': f + 52, 'cue': cue, 'slips': slips,
            'beats': [[0, 'One source: Homer’s description of the Shield of Achilles.'], [24, 'Submitted directly to image generators,'], [54, 'wrapped around a WebGL shield as addressable text,'],
                      [84, 'translated into deterministic animation code,'], [114, 'rendered as a contact sheet,'], [144, 'and returned to a vision model as visual input.'],
                      [f + 4, 'The shield keeps its changes. Each pass leaves a ring.']]}
    return F, spec, 'Film. The article’s sequence of transformations around one shield. Each station is a place where the description acts.'


# ------------------------------------------------------------------ The Pronoun Alibi · I · it · we · they
def pronoun():
    F = Fig('alibi2', 960, 540, 'Credit pulls agency toward I; liability sends it to it, they and we')
    F.add('ground', '<path d="M30 452H930" stroke="%s" stroke-width="2"/>' % INK)
    F.add('ped', '<rect x="440" y="320" width="80" height="132" fill="#e7dccb" stroke="%s" stroke-width="2"/>' % INK)
    F.add('frame', '<rect x="410" y="170" width="140" height="150" fill="#fffdf6" stroke="%s" stroke-width="3"/>' % INK)
    F.add('paint', '<path d="M422 300 C 450 250, 480 270, 500 240 S 530 250, 538 230 V300Z" fill="#7ea292" stroke="%s" stroke-width="1.6"/>' % INK)
    F.add('sun', '<circle cx="508" cy="208" r="16" fill="#e8b730" stroke="%s" stroke-width="1.6"/>' % INK)
    F.add('crack', '<path d="M470 172 L462 206 L478 224 L458 262 L470 290" fill="none" stroke="%s" stroke-width="2.4"/>' % INK)
    F.add('I', t(230, 110, 'I', 64, SERIF, '#315d79', 400, 'middle'))
    F.add('it', t(730, 110, 'it', 64, SERIF, '#9a3328', 400, 'middle'))
    F.add('they', t(880, 300, 'they', 34, SERIF, '#9a3328', 400, 'middle'))
    F.add('we', t(480, 128, 'we', 34, SERIF, '#5f5b52', 400, 'middle'))
    F.add('credit', '<path d="M406 214 C 360 190, 310 186, 262 204" fill="none" stroke="#315d79" stroke-width="3" stroke-linecap="round"/>')
    F.add('creditTip', '<path d="M276 194 L260 205 L276 214" fill="none" stroke="#315d79" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')
    F.add('creditT', t(300, 248, 'credit pulls agency inward', 15, SERIF, '#315d79', 400, 'middle'))
    F.add('liab', '<path d="M554 270 C 610 300, 650 300, 694 282" fill="none" stroke="#9a3328" stroke-width="3" stroke-linecap="round"/>')
    F.add('liabTip', '<path d="M680 274 L696 282 L682 292" fill="none" stroke="#9a3328" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')
    F.add('liab2', '<path d="M770 330 C 800 350, 830 360, 852 384" fill="none" stroke="#9a3328" stroke-width="3" stroke-linecap="round"/>')
    F.add('liabT', t(618, 320, 'liability sends it elsewhere', 15, SERIF, '#9a3328', 400, 'middle'))
    for k in range(3):
        F.add('crowd%d' % k, '<path d="M%d 452 v-30 a10 10 0 0 1 20 0 v30z M%d 410 a8 8 0 1 0 0.1 0" fill="#d9d5c8" stroke="%s" stroke-width="1.8"/>' % (846 + k * 28, 856 + k * 28, INK))
    F.add('cap', t(480, 508, 'Judge the relation each participant could meaningfully control.', 17, SERIF, INK, 400, 'middle'))
    STAR = '<path d="M0 -12 L3 -3 L12 -3 L5 3 L8 12 L0 6 L-8 12 L-5 3 L-12 -3 L-3 -3Z" fill="#e8b730" stroke="#141412" stroke-width="1.5"/>'
    cast = [{'rig': 'figure', 'base': {'x': 230, 'y': 452, 'k': .95, 'gaze': [1, -.2]},
             'keys': [[0, {}], [36, {'gaze': [1, -.4]}], [44, {'lean': -.1, 'hF': [6, -24], 'mouth': 'grin', 'say': 'I made it'}, 'overshoot'], [74, {'say': 'I made it'}],
                      [78, {'say': None, 'lean': 0, 'hF': [8, 28]}], [92, {'mouth': 'o', 'sweat': True, 'gaze': [1, 0]}], [100, {'mouth': 'frown'}],
                      [106, {'hF': [26, -4], 'lean': .08, 'say': 'it did it', 'gaze': [1, -.1]}, 'overshoot'], [140, {'say': 'it did it'}], [144, {'say': None, 'hF': [8, 28], 'lean': 0}],
                      [176, {'mouth': 'flat', 'sweat': False, 'gaze': [1, -.6]}]]},
            {'rig': 'figure', 'base': {'x': 730, 'y': 452, 'k': .95, 'kind': 'robot', 'dir': -1, 'gaze': [1, 0], 'glow': '#7a2a24'},
             'keys': [[0, {}], [108, {'glow': '#e74c3c', 'lean': -.12, 'hipH': 42}, 'overshoot'], [120, {'lean': 0, 'hipH': 44, 'glow': '#c0392b'}], [150, {'gaze': [-1, .2]}]]}]
    cast += [{'rig': 'prop', 'art': STAR, 'base': {'x': x, 'y': y, 's': 0}, 'keys': [[24 + d, {}], [30 + d, {'s': 1.2}, 'overshoot'], [70, {'s': 1}], [80, {'s': 0, 'o': 0}]]}
             for (x, y, d) in ((392, 160, 0), (566, 150, 4), (380, 300, 8), (580, 320, 2), (480, 146, 6))]
    cue = [['ground', 0, 14, 'draw'], ['ped', 2, 10, 'pop'], ['frame', 6, 12, 'pop'], [['paint', 'sun'], 12, 10, 'pop'],
           ['credit', 34, 14, 'draw'], ['creditTip', 48, 6, 'pop'], ['I', 44, 8, 'pop'], ['creditT', 50, 14, 'words'],
           ['crack', 86, 8, 'draw', 'linear'], [['frame', 'paint', 'sun'], 86, 10, 'pulse', 'inout', .03],
           ['liab', 104, 14, 'draw'], ['liabTip', 118, 6, 'pop'], ['it', 112, 8, 'pop'], ['liabT', 120, 14, 'words'],
           ['liab2', 138, 14, 'draw'], [['crowd0', 'crowd1', 'crowd2'], 146, 10, 'pop'], ['they', 150, 8, 'pop'],
           ['we', 166, 10, 'pop'], ['we', 178, 12, 'pulse', 'inout', .15], ['cap', 186, 26, 'words']]
    slips = [{'segs': [[34, 48, {'p': 'credit'}, 'inout']], 'hide': 58}, {'segs': [[104, 118, {'p': 'liab'}, 'inout'], [126, 138, [694, 282], [770, 330], 'inout', 20], [138, 152, {'p': 'liab2'}, 'inout']], 'hide': 160}]
    spec = {'len': 220, 'cue': cue, 'slips': slips, 'cast': cast,
            'beats': [[0, 'An artifact is made.'], [24, 'Applause arrives,'], [34, 'and credit pulls agency inward: I.'], [86, 'Then harm, or liability.'],
                      [104, 'Now the machine did it: it.'], [138, 'Or the supply chain: they.'], [166, 'Or the institution apologises: we.'],
                      [186, 'The essay judges the relation each participant could meaningfully control.']]}
    return F, spec, 'Film. The case grammar of the essay: I · it · we · they. The pronoun changes after the value is judged.'


BUILD = {'ripples': ripples, 'lego': lego, 'playfreedom': playfreedom, 'ekphrasis': ekphrasis, 'pronoun': pronoun}

if __name__ == '__main__':
    out = {}
    for key, fn in BUILD.items():
        F, spec, cap = fn()
        out[key] = {'id': F.id, 'svg': F.svg(), 'spec': resolve(F, spec), 'cap': cap}
    json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False)
    print({k: (v['id'], len(v['svg'])) for k, v in out.items()})
