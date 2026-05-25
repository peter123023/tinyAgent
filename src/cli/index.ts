import { ReActAgent } from '../agent/react';
import { getAllTools } from '../tools';

export async function startCLI() {
  const agent = new ReActAgent({}, getAllTools());

  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     🤖 Tiny Agent - ReAct Mode (CLI)    ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Enter your question, or type "exit"     ║');
  console.log('║  to quit.                                ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  const readline = (await import('readline')).default;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  rl.prompt();

  for await (const line of rl) {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      continue;
    }
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('Goodbye!');
      rl.close();
      process.exit(0);
    }

    console.log('\nProcessing...\n');
    try {
      const result = await agent.run(input);
      console.log('\n' + '='.repeat(50));
      console.log('Final Answer:');
      console.log(result.finalAnswer);
      console.log('='.repeat(50) + '\n');
    } catch (err: any) {
      console.error('Error:', err.message);
    }

    rl.prompt();
  }
}
