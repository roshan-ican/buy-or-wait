import Foundation
import Vision
import AppKit
let path = CommandLine.arguments[1]
guard let img = NSImage(contentsOfFile: path), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("LOADFAIL"); exit(1) }
let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
req.usesLanguageCorrection = false
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try handler.perform([req])
for obs in (req.results ?? []) {
    if let t = obs.topCandidates(1).first { 
        let b = obs.boundingBox
        print(String(format: "%.3f\t%.3f\t%@", b.minX, 1 - b.maxY, t.string))
    }
}
