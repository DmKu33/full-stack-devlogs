"""
MIDI to Strudel converter (adapted from Emanuel-de-Jong/MIDI-To-Strudel, GPL-3.0)
Usage:
  pip install mido
  python3 convert-midi.py -m "/path/to/file.mid"
Output: prints Strudel code + writes result.txt
"""

from collections import defaultdict
import argparse
import logging
import glob
import math
import sys
import os
import mido


def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(logging.Formatter("[{levelname}]: {message}", style="{"))
    logger.addHandler(stream_handler)
    return logger


logger = setup_logging()

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def note_num_to_str(n):
    return NOTE_NAMES[n % 12].lower() + str(n // 12 - 1)


def get_timing_values(mid):
    tempo = 500000
    for msg in mid.tracks[0]:
        if msg.type == 'set_tempo':
            tempo = msg.tempo
            break
    bpm = mido.tempo2bpm(tempo)
    cycle_len = 60 / bpm * 4
    return tempo, bpm, cycle_len


def collect_note_events(mid, tempo):
    events = defaultdict(list)
    for i, track in enumerate(mid.tracks):
        time_sec = 0
        for msg in track:
            time_sec += mido.tick2second(msg.time, mid.ticks_per_beat, tempo)
            if msg.type == 'note_on' and msg.velocity > 0:
                events[i].append((time_sec, note_num_to_str(msg.note)))
    return events


def adjust_near_cycle_end(events, cycle_len):
    adjusted = []
    for t, note in events:
        rel = (t % cycle_len) / cycle_len
        if rel > 0.95:
            adjusted.append((math.ceil(t / cycle_len) * cycle_len, note))
        else:
            adjusted.append((t, note))
    return adjusted


def quantize_time(timestamp, cycle_start, cycle_len, notes_per_bar):
    rel_time = (timestamp - cycle_start) / cycle_len
    quantized = round(rel_time * notes_per_bar) / notes_per_bar
    return min(quantized, 1.0 - 1e-9)


def simplify_subdivisions(subdivs):
    current = subdivs
    while len(current) % 2 == 0:
        pairs = list(zip(current[::2], current[1::2]))
        if any(second != '-' for _, second in pairs):
            break
        current = [first for first, _ in pairs]
    return current


def get_poly_mode_bar(events, cycle_start, cycle_len, notes_per_bar):
    time_groups = defaultdict(list)
    for t, n in events:
        pos = quantize_time(t, cycle_start, cycle_len, notes_per_bar)
        for existing in time_groups:
            if abs(pos - existing) < 1 / notes_per_bar:
                time_groups[existing].append(n)
                break
        else:
            time_groups[pos].append(n)

    if not time_groups:
        return '-'

    subdivisions = ['-'] * notes_per_bar
    for pos in sorted(time_groups):
        i = int(round(pos * notes_per_bar))
        if i < notes_per_bar:
            group = time_groups[pos]
            subdivisions[i] = group[0] if len(group) == 1 else f"[{','.join(group)}]"

    if all(x == '-' for x in subdivisions):
        return '-'

    simplified = simplify_subdivisions(subdivisions)
    return simplified[0] if len(simplified) == 1 else f"[{' '.join(simplified)}]"


def build_tracks(events, cycle_len, bar_limit, notes_per_bar):
    tracks = []
    for track in sorted(events):
        evs = adjust_near_cycle_end(events[track], cycle_len)
        if not evs:
            continue

        max_time = max(t for t, _ in evs)
        num_cycles = int(max_time / cycle_len) + 1
        if bar_limit > 0:
            num_cycles = min(num_cycles, bar_limit)
        bars = []

        for c in range(num_cycles):
            start = c * cycle_len
            end = start + cycle_len
            notes_in_cycle = [(t, n) for t, n in evs if start <= t < end]

            if not notes_in_cycle:
                bars.append('-')
                continue

            bar = get_poly_mode_bar(notes_in_cycle, start, cycle_len, notes_per_bar)
            bars.append(bar)

        if bars:
            tracks.append(bars)

    return tracks


def build_output(tracks, bpm, tab_size=2):
    indent = ' ' * tab_size * 2
    lines = [f"setcpm({int(bpm)}/4)\n"]
    for bars in tracks:
        lines.append('$: note(`<')
        for i in range(0, len(bars), 4):
            chunk = bars[i:i + 4]
            lines.append(f"{indent}{' '.join(chunk)}")
        lines[-1] += '>`).sound("piano")'
        lines.append('')
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Convert MIDI to Strudel notation')
    parser.add_argument('-m', '--midi', type=str, help='Path to MIDI file')
    parser.add_argument('-b', '--bar-limit', type=int, default=0)
    parser.add_argument('-t', '--tab-size', type=int, default=2)
    parser.add_argument('-n', '--notes-per-bar', type=int, default=64)
    args = parser.parse_args()

    midi_path = args.midi
    if not midi_path:
        midi_files = glob.glob('*.mid')
        if not midi_files:
            print('No MIDI file found. Use -m /path/to/file.mid')
            sys.exit(1)
        midi_path = midi_files[0]

    if not os.path.exists(midi_path):
        print(f'File not found: {midi_path}')
        sys.exit(1)

    mid = mido.MidiFile(midi_path)
    tempo, bpm, cycle_len = get_timing_values(mid)
    events = collect_note_events(mid, tempo)
    tracks = build_tracks(events, cycle_len, args.bar_limit, args.notes_per_bar)
    output = build_output(tracks, bpm, args.tab_size)

    print(output)
    with open('result.txt', 'w') as f:
        f.write(output + '\n')
    print('\n--- also written to result.txt ---')


if __name__ == '__main__':
    main()
